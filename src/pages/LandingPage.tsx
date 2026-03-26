import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface LandingPageProps {
  onCreateRoom: (name: string) => void;
  onJoinRoom: (roomId: string, name: string) => void;
}

export function LandingPage({ onCreateRoom, onJoinRoom }: LandingPageProps) {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [tab, setTab] = useState<"create" | "join">("create");
  const [error, setError] = useState("");

  function handleCreate() {
    if (!name.trim()) { setError("Enter your name first!"); return; }
    setError("");
    onCreateRoom(name.trim());
  }

  function handleJoin() {
    if (!name.trim()) { setError("Enter your name first!"); return; }
    if (!roomCode.trim()) { setError("Enter a room code!"); return; }
    setError("");
    onJoinRoom(roomCode.trim().toUpperCase(), name.trim());
  }

  return (
    <div className="landing">
      {/* Floating frogs decoration */}
      <div className="bg-frogs" aria-hidden>
        {["🐸","🐸","🐸","🐸","🐸"].map((f,i) => (
          <span key={i} className={`bg-frog bg-frog-${i}`}>{f}</span>
        ))}
      </div>

      <div className="landing-card">
        <div className="logo-area">
          <span className="logo-frog">🐸</span>
          <h1 className="logo-title">FROG RACE</h1>
          <p className="logo-subtitle">The ultimate typing showdown</p>
        </div>

        {/* Name input always visible */}
        <div className="field">
          <label className="field-label">YOUR NAME</label>
          <input
            className="field-input"
            placeholder="FluxScriptNX"
            value={name}
            maxLength={20}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (tab === "create" ? handleCreate() : handleJoin())}
            autoFocus
          />
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab-btn ${tab === "create" ? "active" : ""}`}
            onClick={() => setTab("create")}
          >
            Create Room
          </button>
          <button
            className={`tab-btn ${tab === "join" ? "active" : ""}`}
            onClick={() => setTab("join")}
          >
            Join Room
          </button>
        </div>

        {tab === "create" && (
          <div className="tab-content">
            <p className="hint">You'll be the host. Share the room code with friends!</p>
            <button className="btn-primary" onClick={handleCreate}>
              🐸 Create Room
            </button>
          </div>
        )}

        {tab === "join" && (
          <div className="tab-content">
            <div className="field">
              <label className="field-label">ROOM CODE</label>
              <input
                className="field-input code-input"
                placeholder="ABCD12"
                value={roomCode}
                maxLength={8}
                onChange={e => setRoomCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === "Enter" && handleJoin()}
              />
            </div>
            <button className="btn-primary" onClick={handleJoin}>
              🐸 Join Race
            </button>
          </div>
        )}

        {error && <p className="error-msg">⚠️ {error}</p>}
      </div>
    </div>
  );
}
