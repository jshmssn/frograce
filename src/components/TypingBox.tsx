import { useEffect, useRef, useState, useCallback } from "react";
import type { ClientMessage } from "../lib/types";

interface TypingBoxProps {
  text: string;
  disabled: boolean;
  onProgress: (progress: number, wpm: number, accuracy: number) => void;
  onFinished: (wpm: number, accuracy: number) => void;
  send: (msg: ClientMessage) => void;
  raceStartedAt: number | null;
}

export function TypingBox({ text, disabled, onProgress, onFinished, raceStartedAt }: TypingBoxProps) {
  const [typed, setTyped] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const progressSentRef = useRef(0);

  // Focus input on mount/race start
  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  // Reset when race restarts
  useEffect(() => {
    setTyped("");
    setStartedAt(null);
    setDone(false);
    progressSentRef.current = 0;
  }, [raceStartedAt]);

  const calcStats = useCallback((typedSoFar: string, time: number) => {
    const words = typedSoFar.trim().split(/\s+/).length;
    const minutes = time / 60000;
    const wpm = minutes > 0 ? Math.round(words / minutes) : 0;

    let correct = 0;
    for (let i = 0; i < typedSoFar.length; i++) {
      if (typedSoFar[i] === text[i]) correct++;
    }
    const accuracy = typedSoFar.length > 0
      ? Math.round((correct / typedSoFar.length) * 100)
      : 100;

    return { wpm, accuracy };
  }, [text]);

  function getCorrectPrefixLength(typedSoFar: string) {
    let correctPrefix = 0;
    while (correctPrefix < typedSoFar.length && typedSoFar[correctPrefix] === text[correctPrefix]) {
      correctPrefix++;
    }
    return correctPrefix;
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (disabled || done) return;

    const val = e.target.value;

    // Only allow typing that matches text length
    if (val.length > text.length) return;
    // Lock input to append-only so previous mistakes cannot be edited away.
    if (val.length < typed.length) return;
    if (!val.startsWith(typed)) return;

    const now = Date.now();
    if (!startedAt) setStartedAt(now);
    const elapsed = startedAt ? now - startedAt : 0;

    setTyped(val);

    const correctPrefixLength = getCorrectPrefixLength(val);
    const progress = Math.round((correctPrefixLength / text.length) * 100);
    const { wpm, accuracy } = calcStats(val, elapsed);

    // Throttle progress updates to every ~1%
    if (progress > progressSentRef.current) {
      progressSentRef.current = progress;
      onProgress(progress, wpm, accuracy);
    }

    // Check finished
    if (val === text) {
      setDone(true);
      onFinished(wpm, accuracy);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
    }
  }

  // Build character display
  const chars = text.split("").map((char, i) => {
    let cls = "char-pending";
    if (i < typed.length) {
      cls = typed[i] === char ? "char-correct" : "char-wrong";
    } else if (i === typed.length) {
      cls = "char-cursor";
    }
    return { char, cls };
  });

  return (
    <div className="typing-box">
      {/* Text display */}
      <div
        className="typing-text"
        onClick={() => inputRef.current?.focus()}
      >
        {chars.map(({ char, cls }, i) => (
          <span key={i} className={cls}>
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </div>

      {/* Hidden input */}
      <input
        ref={inputRef}
        className="typing-input"
        value={typed}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        disabled={disabled || done}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label="Type here"
      />

      {done && (
        <div className="finished-overlay">
          <span>🐸 You finished!</span>
        </div>
      )}
    </div>
  );
}
