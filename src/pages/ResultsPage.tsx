import type { RoomState, ClientMessage } from "../lib/types";

interface ResultsPageProps {
  state: RoomState;
  myId: string;
  send: (msg: ClientMessage) => void;
}

const MEDALS = ["🥇", "🥈", "🥉"];
const RANK_SUFFIX = ["st", "nd", "rd"];

export function ResultsPage({ state, myId, send }: ResultsPageProps) {
  const players = Object.values(state.players).sort((a, b) => {
    if (a.rank !== null && b.rank !== null) return a.rank - b.rank;
    if (a.rank !== null) return -1;
    if (b.rank !== null) return 1;
    return b.progress - a.progress;
  });

  const winner = state.winnerId ? state.players[state.winnerId] : null;
  const isHost = state.players[myId]?.isHost;

  return (
    <div className="results-page">
      {/* Winner banner */}
      <div className="winner-banner">
        <div className="winner-frogs">🐸🐸🐸</div>
        <h1 className="winner-title">
          {winner ? `${winner.name} wins!` : "Race Over!"}
        </h1>
        <p className="winner-subtitle">
          {winner?.id === myId ? "🎉 That's you!" : "Better luck next time!"}
        </p>
      </div>

      {/* Leaderboard */}
      <div className="leaderboard">
        <h2 className="section-title">RESULTS</h2>
        {players.map((p, i) => {
          const rank = p.rank ?? i + 1;
          const medal = MEDALS[rank - 1] ?? `${rank}${RANK_SUFFIX[rank - 1] ?? "th"}`;
          return (
            <div
              key={p.id}
              className={`result-row ${p.id === myId ? "me" : ""} ${rank === 1 ? "winner-row" : ""}`}
            >
              <span className="result-medal">{medal}</span>
              <span className="frog-icon" style={{ filter: `drop-shadow(0 0 6px ${p.color})` }}>🐸</span>
              <span className="result-name">
                {p.name}
                {p.id === myId && <span className="you-badge"> (you)</span>}
              </span>
              <span className="result-stat">{Math.round(p.progress)}%</span>
              <span className="result-stat">{p.wpm} WPM</span>
              <span className="result-stat">{p.accuracy}% acc</span>
              <span className="result-status">
                {p.finishedAt !== null ? "✓ Finished" : "⏸ Incomplete"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="results-actions">
        {isHost ? (
          <button className="btn-primary" onClick={() => send({ type: "rematch" })}>
            🔄 Play Again
          </button>
        ) : (
          <p className="hint">Waiting for host to start a rematch…</p>
        )}
      </div>
    </div>
  );
}
