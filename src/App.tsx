import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { LandingPage } from "./pages/LandingPage";
import { LobbyPage } from "./pages/LobbyPage";
import { RacePage } from "./pages/RacePage";
import { ResultsPage } from "./pages/ResultsPage";
import { useRoom } from "./hooks/useRoom";

// Persist player ID across page reloads
function getOrCreatePlayerId() {
  const key = "frogracing_player_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(key, id);
  }
  return id;
}

// Generate a short, human-readable room code
function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

type AppScreen = "landing" | "room";

export default function App() {
  const [screen, setScreen] = useState<AppScreen>("landing");
  const [roomId, setRoomId] = useState<string>("");
  const playerIdRef = useRef(getOrCreatePlayerId());
  const playerNameRef = useRef("");
  const joinedRef = useRef(false);

  const { roomState, connected, send } = useRoom(roomId, playerIdRef);

  // Once connected to a room, send join message (once only)
  useEffect(() => {
    if (connected && roomId && !joinedRef.current) {
      joinedRef.current = true;
      send({ type: "join", name: playerNameRef.current });
    }
    if (!connected) {
      joinedRef.current = false;
    }
  }, [connected, roomId]);

  function handleCreateRoom(name: string) {
    playerNameRef.current = name;
    joinedRef.current = false;
    const code = generateRoomCode();
    setRoomId(code);
    setScreen("room");
  }

  function handleJoinRoom(code: string, name: string) {
    playerNameRef.current = name;
    joinedRef.current = false;
    setRoomId(code);
    setScreen("room");
  }

  if (screen === "landing") {
    return <LandingPage onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} />;
  }

  // Show connecting state
  if (!roomState || !connected) {
    return (
      <div className="connecting-screen">
        <div className="connecting-inner">
          <div className="connecting-frog">🐸</div>
          <p className="connecting-msg">Connecting to room <strong>{roomId}</strong>…</p>
          <button className="btn-secondary small" onClick={() => { setScreen("landing"); setRoomId(""); }}>
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // Guard: player hasn't appeared in state yet (race in progress on join)
  const myPlayer = roomState.players[playerIdRef.current];
  if (!myPlayer && roomState.phase !== "lobby") {
    return (
      <div className="connecting-screen">
        <div className="connecting-inner">
          <div className="connecting-frog">🐸</div>
          <p className="connecting-msg">A race is in progress. Please wait for the next round.</p>
          <button className="btn-secondary small" onClick={() => { setScreen("landing"); setRoomId(""); }}>
            ← Leave
          </button>
        </div>
      </div>
    );
  }

  const myId = playerIdRef.current;

  switch (roomState.phase) {
    case "lobby":
      return <LobbyPage state={roomState} myId={myId} send={send} />;
    case "countdown":
    case "racing":
      return <RacePage state={roomState} myId={myId} send={send} />;
    case "finished":
      return <ResultsPage state={roomState} myId={myId} send={send} />;
    default:
      return null;
  }
}
