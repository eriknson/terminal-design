"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

// Horizontal lockup frames from horizontal-lockup-animation-frame-1..8.txt
const LOCKUP_FRAMES: string[] = [
  "     .db.\n  „gḡḡḡḡḡḡg„\n b.         d    o8888 88   88 88888o „d8888  d8A8b  88888.\n 888b._    d8   dP     88   88 88__8P Y8„„_  dP   Yb 88__8P\n 888888   d88   Y8     88   8P 88\"\"8o  `\"\"Y8 Yb   dP 88\"\"8o\n Y88888  d88P    Y8888 `Y8odP’ 88  YA 88888\"  Y8odP  88  YA\n   `Y88 dP\"\n      `\"",
  "     .o.\n  „o888888oo„_\n  8b..       /   o8888 88   88 88888o „d8888  d8A8b  88888.\n d8888887  .8   dP     88   88 88__8P Y8„„_  dP   Yb 88__8P\n 8888888” .8’   Y8     88   8P 88\"\"8o  `\"\"Y8 Yb   dP 88\"\"8o\n.8888888 .88     Y8888 `Y8odP’ 88  YA 88888\"  Y8odP  88  YA\n   `Y88P.P”\n       \"`",
  "     .db.\n  „d888888b„\n 888888888888    o8888 88   88 88888o „d8888  d8A8b  88888.\n 888888888888   dP     88   88 88__8P Y8„„_  dP   Yb 88__8P\n 888888888888   Y8     88   8P 88\"\"8o  `\"\"Y8 Yb   dP 88\"\"8o\n Y8888888888P    Y8888 `Y8odP’ 88  YA 88888\"  Y8odP  88  YA\n   `Y8888P\"\n      `\"",
  "     .\n  .88888bo.„_\n   888888888Y    o8888 88   88 88888o „d8888  d8A8b  88888.\n   Y88888888”   dP     88   88 88__8P Y8„„_  dP   Yb 88__8P\n   `8888888Y    Y8     88   8P 88\"\"8o  `\"\"Y8 Yb   dP 88\"\"8o\n     `88888”     Y8888 `Y8odP’ 88  YA 88888\"  Y8odP  88  YA\n      `Y8P”\n      ",
  "     .db.\n  .d88888b.\n\\``````````.     o8888 88   88 88888o „d8888  d8A8b  88888.\n Y.       .8.   dP     88   88 88__8P Y8„„_  dP   Yb 88__8P\n `88.    .88b   Y8     88   8P 88\"\"8o  `\"\"Y8 Yb   dP 88\"\"8o\n  \"Yb   .8888\"   Y8888 `Y8odP’ 88  YA 88888\"  Y8odP  88  YA\n   `Y. .8P\"\n     ` \"",
  "     .db.\n  „gḡḡḡḡḡḡg„\n b.         d    o8888 88   88 88888o „d8888  d8A8b  88888.\n 888b._    d8   dP     88   88 88__8P Y8„„_  dP   Yb 88__8P\n 888888   d88   Y8     88   8P 88\"\"8o  `\"\"Y8 Yb   dP 88\"\"8o\n Y88888  d88P    Y8888 `Y8odP’ 88  YA 88888\"  Y8odP  88  YA\n   `Y88 dP\"\n      `\"",
  "     .db.\n  „gḡḡḡḡḡḡg„\n b.         d    o8888 88   88 88888o „d8888  d8A8b  88888.\n 888b._    d8   dP     88   88 88__8P Y8„„_  dP   Yb 88__8P\n 888888   d88   Y8     88   8P 88\"\"8o  `\"\"Y8 Yb   dP 88\"\"8o\n Y88888  d88P    Y8888 `Y8odP’ 88  YA 88888\"  Y8odP  88  YA\n   `Y88 dP\"\n      `\"",
  "     .db.\n  „gḡḡḡḡḡḡg„\n b.         d    o8888 88   88 88888o „d8888  d8A8b  88888.\n 888b._    d8   dP     88   88 88__8P Y8„„_  dP   Yb 88__8P\n 888888   d88   Y8     88   8P 88\"\"8o  `\"\"Y8 Yb   dP 88\"\"8o\n Y88888  d88P    Y8888 `Y8odP’ 88  YA 88888\"  Y8odP  88  YA\n   `Y88 dP\"\n      `\""
];

const FRAME_MS = 100;
const PAUSE_MS = 1800;

export default function AuthAltPanel() {
  const [frameIndex, setFrameIndex] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const frameRef = useRef(0);

  const scheduleNext = useCallback(() => {
    const next = (frameRef.current + 1) % LOCKUP_FRAMES.length;
    const delay = next === 0 ? PAUSE_MS : FRAME_MS;
    timeoutRef.current = setTimeout(() => {
      frameRef.current = next;
      setFrameIndex(next);
      scheduleNext();
    }, delay);
  }, []);

  useEffect(() => {
    scheduleNext();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [scheduleNext]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="font-berkeley-mono flex h-full w-full flex-col overflow-hidden text-[12px]"
      style={{
        backgroundColor: "var(--color-theme-bg-muted)",
        color: "var(--color-theme-text-sec)",
      }}
    >
      <div className="flex flex-1 flex-col justify-start overflow-hidden px-4 pt-4 pb-2">
        <div className="space-y-3">
          {/* Command line */}
          <div>
            <span style={{ color: "var(--color-theme-text-ter)" }}>&gt; </span>
            <span style={{ color: "var(--color-theme-text-sec)" }}>agent</span>
          </div>

          {/* Horizontal lockup — left aligned */}
          <pre
            className="text-[11px] leading-[1.35]"
            style={{ color: "var(--color-theme-text-sec)" }}
          >
            {LOCKUP_FRAMES[frameIndex]}
          </pre>

          {/* Press any key — left aligned */}
          <div
            className="text-[13px]"
            style={{ color: "var(--color-theme-text)" }}
          >
            Press any key to authenticate...
            <span
              className="ml-0.5 inline-block w-[7px]"
              style={{
                backgroundColor: cursorVisible
                  ? "var(--color-theme-text)"
                  : "transparent",
                height: "14px",
                verticalAlign: "text-bottom",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
