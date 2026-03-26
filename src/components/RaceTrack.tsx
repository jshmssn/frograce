import type { Player } from "../lib/types";

interface RaceTrackProps {
  players: Player[];
  myId: string;
}

export function RaceTrack({ players, myId }: RaceTrackProps) {
  return (
    <div className="race-track-container">
      {players.map((p) => (
        <div key={p.id} className="lane">
          <div className="lane-label">
            <span className="lane-name">
              {p.name}
              {p.id === myId && <span className="you-badge-small"> (you)</span>}
            </span>
            <span className="lane-stats">
              {Math.round(p.progress)}% · {p.wpm} WPM
            </span>
          </div>
          <div className="lane-track">
            {/* Track stripes */}
            <div className="track-stripe" />
            {/* Finish line */}
            <div className="finish-line">🏁</div>
            {/* Frog */}
            <div
              className={`frog-runner ${p.finishedAt !== null ? "finished" : "hopping"}`}
              style={{
                left: `calc(${p.progress}% - 2rem)`,
                filter: `drop-shadow(0 0 8px ${p.color})`,
                transitionDuration: "0.3s",
              }}
            >
              <div className="frog-emoji">🐸</div>
              {p.rank === 1 && <div className="rank-crown">👑</div>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
