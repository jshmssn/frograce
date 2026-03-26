import { useState } from "react";
import type { RoomState } from "../lib/types";
import type { ClientMessage } from "../lib/types";

interface LobbyPageProps {
  state: RoomState;
  myId: string;
  send: (msg: ClientMessage) => void;
}

export function LobbyPage({ state, myId, send }: LobbyPageProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [settingWords, setSettingWords] = useState(state.settings.wordCount);
  const [settingTime, setSettingTime] = useState(state.settings.timeLimit);
  const [copied, setCopied] = useState(false);

  const me = state.players[myId];
  const players = Object.values(state.players);
  const allReady = players.length > 0 && players.every(p => p.isReady);
  const isHost = me?.isHost ?? false;

  function copyCode() {
    navigator.clipboard.writeText(state.roomId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function saveSettings() {
    send({ type: "update_settings", settings: { wordCount: settingWords, timeLimit: settingTime } });
    setShowSettings(false);
  }

  return (
    <div className="lobby">
      {/* Settings modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">⚙️ Game Settings</h2>

            <div className="field">
              <label className="field-label">WORD COUNT (min 500)</label>
              <input
                type="number"
                className="field-input"
                value={settingWords}
                min={500}
                max={2000}
                step={100}
                onChange={e => setSettingWords(Math.max(500, Number(e.target.value)))}
              />
            </div>

            <div className="field">
              <label className="field-label">TIME LIMIT (seconds)</label>
              <input
                type="number"
                className="field-input"
                value={settingTime}
                min={30}
                max={600}
                step={30}
                onChange={e => setSettingTime(Math.max(30, Number(e.target.value)))}
              />
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowSettings(false)}>Cancel</button>
              <button className="btn-primary" onClick={saveSettings}>Save</button>
            </div>
          </div>
        </div>
      )}

      <div className="lobby-layout">
        {/* Header */}
        <div className="lobby-header">
          <h1 className="lobby-title">🐸 FROG RACE</h1>
          <div className="room-code-area">
            <span className="room-code-label">ROOM CODE</span>
            <button className="room-code-btn" onClick={copyCode} title="Click to copy">
              {state.roomId}
              <span className="copy-hint">{copied ? "✓ Copied!" : "📋"}</span>
            </button>
          </div>
          {isHost && (
            <button className="settings-btn" onClick={() => setShowSettings(true)} title="Settings">
              ⚙️
            </button>
          )}
        </div>

        {/* Settings preview */}
        <div className="settings-preview">
          <span>📝 {state.settings.wordCount} words</span>
          <span>⏱ {state.settings.timeLimit}s limit</span>
        </div>

        {/* Player list */}
        <div className="player-list">
          <h2 className="section-title">PLAYERS ({players.length})</h2>
          {players.length === 0 && (
            <p className="hint">Waiting for players to join…</p>
          )}
          {players.map(p => (
            <div key={p.id} className={`player-row ${p.id === myId ? "me" : ""}`}>
              <span className="frog-icon" style={{ filter: `drop-shadow(0 0 6px ${p.color})` }}>🐸</span>
              <span className="player-name">
                {p.name}
                {p.isHost && <span className="host-badge">HOST</span>}
                {p.id === myId && <span className="you-badge">YOU</span>}
              </span>
              <span className={`ready-badge ${p.isReady ? "ready" : "not-ready"}`}>
                {p.isReady ? "✓ Ready" : "Not Ready"}
              </span>
            </div>
          ))}
        </div>

        {/* Status / actions */}
        <div className="lobby-actions">
          {!isHost && me && !me.isReady && (
            <button className="btn-ready" onClick={() => send({ type: "ready" })}>
              ✓ Ready Up!
            </button>
          )}
          {!isHost && me?.isReady && (
            <button className="btn-unready" onClick={() => send({ type: "unready" })}>
              ✗ Not Ready
            </button>
          )}

          {isHost && (
            <button
              className={`btn-start ${allReady ? "active" : "disabled"}`}
              disabled={!allReady}
              onClick={() => allReady && send({ type: "start_race" })}
            >
              {allReady ? "🏁 Start Race!" : "Waiting for all players…"}
            </button>
          )}

          {!allReady && players.length > 1 && (
            <p className="status-msg">
              {players.filter(p => !p.isReady).length} player(s) not ready yet
            </p>
          )}
          {players.length === 1 && (
            <p className="status-msg">Waiting for players to join…</p>
          )}
        </div>
      </div>
    </div>
  );
}
