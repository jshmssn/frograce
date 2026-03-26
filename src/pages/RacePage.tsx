import { useEffect, useRef, useState } from "react";
import type { RoomState, ClientMessage } from "../lib/types";
import { RaceTrack } from "../components/RaceTrack";
import { TypingBox } from "../components/TypingBox";

interface RacePageProps {
  state: RoomState;
  myId: string;
  send: (msg: ClientMessage) => void;
}

export function RacePage({ state, myId, send }: RacePageProps) {
  const players = Object.values(state.players).sort((a, b) => b.progress - a.progress);
  const me = state.players[myId];
  const [timeLeft, setTimeLeft] = useState(state.settings.timeLimit);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer — must be before any early returns (Rules of Hooks)
  useEffect(() => {
    if (state.phase !== "racing" || !state.raceStartedAt) return;

    function tick() {
      const elapsed = (Date.now() - (state.raceStartedAt ?? Date.now())) / 1000;
      const remaining = Math.max(0, state.settings.timeLimit - elapsed);
      setTimeLeft(Math.ceil(remaining));
    }

    tick();
    timerRef.current = setInterval(tick, 500);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.phase, state.raceStartedAt]);

  // Countdown display — early return AFTER all hooks
  if (state.phase === "countdown") {
    return (
      <div className="countdown-screen">
        <div className="countdown-bg-frogs" aria-hidden>
          {["🐸","🐸","🐸"].map((f,i)=><span key={i} className={`bg-frog bg-frog-${i}`}>{f}</span>)}
        </div>
        <div className="countdown-box">
          <p className="countdown-label">RACE STARTS IN</p>
          <div className="countdown-number">
            {state.countdownValue <= 0 ? "GO!" : state.countdownValue}
          </div>
        </div>
      </div>
    );
  }

  function handleProgress(progress: number, wpm: number, accuracy: number) {
    send({ type: "progress", progress, wpm, accuracy });
  }

  function handleFinished(wpm: number, accuracy: number) {
    send({ type: "finished", wpm, accuracy });
  }

  const timerWarning = timeLeft <= 15;

  return (
    <div className="race-page">
      {/* Header bar */}
      <div className="race-header">
        <span className="race-title">🐸 FROG RACE</span>
        <div className={`timer ${timerWarning ? "warning" : ""}`}>
          ⏱ {timeLeft}s
        </div>
        <span className="room-code-small">Room: {state.roomId}</span>
      </div>

      {/* Race track */}
      <RaceTrack players={players} myId={myId} />

      {/* Typing area */}
      <div className="typing-section">
        <TypingBox
          text={state.text}
          disabled={state.phase !== "racing" || !me || me.finishedAt !== null}
          onProgress={handleProgress}
          onFinished={handleFinished}
          send={send}
          raceStartedAt={state.raceStartedAt}
        />
      </div>

      {/* My stats bar */}
      {me && (
        <div className="my-stats">
          <span>Progress: <strong>{Math.round(me.progress)}%</strong></span>
          <span>WPM: <strong>{me.wpm}</strong></span>
          <span>Accuracy: <strong>{me.accuracy}%</strong></span>
        </div>
      )}
    </div>
  );
}