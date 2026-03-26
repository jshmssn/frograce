// Shared types between frontend and PartyKit server

export type GamePhase =
  | "lobby"
  | "countdown"
  | "racing"
  | "finished";

export interface Player {
  id: string;
  name: string;
  color: string;
  isHost: boolean;
  isReady: boolean;
  progress: number;       // 0–100
  wpm: number;
  accuracy: number;
  finishedAt: number | null; // timestamp
  rank: number | null;
}

export interface GameSettings {
  wordCount: number;      // min 500
  timeLimit: number;      // seconds
}

export interface RoomState {
  roomId: string;
  phase: GamePhase;
  players: Record<string, Player>;
  settings: GameSettings;
  text: string;           // the passage to type
  countdownValue: number; // 3, 2, 1, 0
  raceStartedAt: number | null;
  raceEndedAt: number | null;
  winnerId: string | null;
}

// ── Messages client → server ──────────────────────────────────────────────────

export type ClientMessage =
  | { type: "join";     name: string }
  | { type: "ready" }
  | { type: "unready" }
  | { type: "start_race" }
  | { type: "progress"; progress: number; wpm: number; accuracy: number }
  | { type: "finished"; wpm: number; accuracy: number }
  | { type: "update_settings"; settings: Partial<GameSettings> }
  | { type: "rematch" };

// ── Messages server → client ──────────────────────────────────────────────────

export type ServerMessage =
  | { type: "state"; state: RoomState }
  | { type: "error"; message: string };

// ── Frog color palette ────────────────────────────────────────────────────────

export const FROG_COLORS = [
  "#4ade80", // lime green
  "#f97316", // orange
  "#a78bfa", // violet
  "#fb7185", // rose
  "#38bdf8", // sky blue
  "#fbbf24", // amber
  "#34d399", // emerald
  "#e879f9", // fuchsia
];
