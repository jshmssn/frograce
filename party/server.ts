import type * as Party from "partykit/server";
import type {
  RoomState,
  Player,
  ClientMessage,
  ServerMessage,
  GameSettings,
} from "../src/lib/types";
import { FROG_COLORS } from "../src/lib/types";
import { generateText } from "../src/lib/textGen";

const DEFAULT_SETTINGS: GameSettings = {
  wordCount: 500,
  timeLimit: 120,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeInitialState(roomId: string): RoomState {
  return {
    roomId,
    phase: "lobby",
    players: {},
    settings: { ...DEFAULT_SETTINGS },
    text: "",
    countdownValue: 3,
    raceStartedAt: null,
    raceEndedAt: null,
    winnerId: null,
  };
}

function broadcast(room: Party.Room, state: RoomState) {
  const msg: ServerMessage = { type: "state", state };
  room.broadcast(JSON.stringify(msg));
}

function rankPlayers(state: RoomState) {
  const finished = Object.values(state.players)
    .filter((p) => p.finishedAt !== null)
    .sort((a, b) => (a.finishedAt ?? 0) - (b.finishedAt ?? 0));

  finished.forEach((p, i) => {
    state.players[p.id].rank = i + 1;
  });
}

// ── Server ────────────────────────────────────────────────────────────────────

export default class FrogRacingServer implements Party.Server {
  state: RoomState;
  countdownTimer: ReturnType<typeof setInterval> | null = null;
  raceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(readonly room: Party.Room) {
    this.state = makeInitialState(room.id);
  }

  /** Called when a new WebSocket connection is opened */
  onConnect(conn: Party.Connection) {
    // Send current state to the newcomer
    const msg: ServerMessage = { type: "state", state: this.state };
    conn.send(JSON.stringify(msg));
  }

  /** Called when a WebSocket message arrives */
  onMessage(message: string, sender: Party.Connection) {
    let msg: ClientMessage;
    try {
      msg = JSON.parse(message) as ClientMessage;
    } catch {
      return;
    }

    const state = this.state;

    switch (msg.type) {
      // ── Join ──────────────────────────────────────────────────────────────
      case "join": {
        if (state.phase !== "lobby") {
          // Allow spectators but don't add them to active players
          return;
        }
        const isFirst = Object.keys(state.players).length === 0;
        const colorIndex = Object.keys(state.players).length % FROG_COLORS.length;

        const player: Player = {
          id: sender.id,
          name: msg.name.slice(0, 20),
          color: FROG_COLORS[colorIndex],
          isHost: isFirst,
          isReady: isFirst, // host is auto-ready
          progress: 0,
          wpm: 0,
          accuracy: 100,
          finishedAt: null,
          rank: null,
        };
        state.players[sender.id] = player;
        broadcast(this.room, state);
        break;
      }

      // ── Ready / Unready ───────────────────────────────────────────────────
      case "ready": {
        const p = state.players[sender.id];
        if (p && state.phase === "lobby") {
          p.isReady = true;
          broadcast(this.room, state);
        }
        break;
      }
      case "unready": {
        const p = state.players[sender.id];
        if (p && !p.isHost && state.phase === "lobby") {
          p.isReady = false;
          broadcast(this.room, state);
        }
        break;
      }

      // ── Host starts race ──────────────────────────────────────────────────
      case "start_race": {
        const host = state.players[sender.id];
        if (!host?.isHost) return;
        if (state.phase !== "lobby") return;

        const allReady = Object.values(state.players).every((p) => p.isReady);
        if (!allReady) return;
        if (Object.keys(state.players).length < 1) return;

        // Generate text
        state.text = generateText(state.settings.wordCount);
        state.phase = "countdown";
        state.countdownValue = 3;
        broadcast(this.room, state);

        // Count down 3…2…1…GO
        let count = 3;
        this.countdownTimer = setInterval(() => {
          count--;
          state.countdownValue = count;
          if (count <= 0) {
            clearInterval(this.countdownTimer!);
            this.countdownTimer = null;
            state.phase = "racing";
            state.raceStartedAt = Date.now();
            broadcast(this.room, state);

            // Set race time limit
            this.raceTimer = setTimeout(() => {
              this.endRace("timeout");
            }, state.settings.timeLimit * 1000);
          } else {
            broadcast(this.room, state);
          }
        }, 1000);
        break;
      }

      // ── Progress update ───────────────────────────────────────────────────
      case "progress": {
        const p = state.players[sender.id];
        if (!p || state.phase !== "racing") return;
        if (p.finishedAt !== null) return; // already done

        p.progress = Math.min(100, msg.progress);
        p.wpm = msg.wpm;
        p.accuracy = msg.accuracy;
        broadcast(this.room, state);
        break;
      }

      // ── Player finished ───────────────────────────────────────────────────
      case "finished": {
        const p = state.players[sender.id];
        if (!p || state.phase !== "racing") return;
        if (p.finishedAt !== null) return;

        p.progress = 100;
        p.wpm = msg.wpm;
        p.accuracy = msg.accuracy;
        p.finishedAt = Date.now();
        rankPlayers(state);

        // First finisher wins immediately
        if (!state.winnerId) {
          state.winnerId = sender.id;
          this.endRace("finished");
        } else {
          broadcast(this.room, state);
        }
        break;
      }

      // ── Update settings ───────────────────────────────────────────────────
      case "update_settings": {
        const host = state.players[sender.id];
        if (!host?.isHost || state.phase !== "lobby") return;
        if (msg.settings.wordCount !== undefined) {
          state.settings.wordCount = Math.max(500, msg.settings.wordCount);
        }
        if (msg.settings.timeLimit !== undefined) {
          state.settings.timeLimit = Math.max(30, msg.settings.timeLimit);
        }
        broadcast(this.room, state);
        break;
      }

      // ── Rematch ───────────────────────────────────────────────────────────
      case "rematch": {
        const host = state.players[sender.id];
        if (!host?.isHost || state.phase !== "finished") return;

        // Reset to lobby, preserve players and host
        state.phase = "lobby";
        state.text = "";
        state.countdownValue = 3;
        state.raceStartedAt = null;
        state.raceEndedAt = null;
        state.winnerId = null;
        for (const p of Object.values(state.players)) {
          p.progress = 0;
          p.wpm = 0;
          p.accuracy = 100;
          p.finishedAt = null;
          p.rank = null;
          p.isReady = p.isHost; // host auto-ready, others must re-ready
        }
        broadcast(this.room, state);
        break;
      }
    }
  }

  /** Called when a WebSocket disconnects */
  onClose(conn: Party.Connection) {
    const state = this.state;
    const leaving = state.players[conn.id];
    if (!leaving) return;

    delete state.players[conn.id];

    // If host left, assign new host
    const remaining = Object.values(state.players);
    if (leaving.isHost && remaining.length > 0) {
      remaining[0].isHost = true;
      remaining[0].isReady = true;
    }

    // If nobody left, clean up timers
    if (remaining.length === 0) {
      if (this.countdownTimer) clearInterval(this.countdownTimer);
      if (this.raceTimer) clearTimeout(this.raceTimer);
      this.state = makeInitialState(this.room.id);
      return;
    }

    broadcast(this.room, state);
  }

  // ── Internal ──────────────────────────────────────────────────────────────

  private endRace(reason: "finished" | "timeout") {
    const state = this.state;
    if (state.phase === "finished") return;

    if (this.raceTimer) {
      clearTimeout(this.raceTimer);
      this.raceTimer = null;
    }

    state.phase = "finished";
    state.raceEndedAt = Date.now();

    // Rank remaining players by progress if timeout
    if (reason === "timeout") {
      const unfinished = Object.values(state.players)
        .filter((p) => p.finishedAt === null)
        .sort((a, b) => b.progress - a.progress);

      const finishedCount = Object.values(state.players).filter(
        (p) => p.finishedAt !== null
      ).length;

      unfinished.forEach((p, i) => {
        state.players[p.id].rank = finishedCount + i + 1;
      });

      // Pick winner if nobody finished
      if (!state.winnerId && unfinished.length > 0) {
        state.winnerId = unfinished[0].id;
      }
    }

    broadcast(this.room, state);
  }
}

FrogRacingServer satisfies Party.Worker;
