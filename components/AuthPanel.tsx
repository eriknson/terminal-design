"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

// All 8 frames read directly from assets/cube-frames/1..8.txt
const CUBE_FRAMES: string[] = [
  "     .db.\n  „gḡḡḡḡḡḡg„\n b.         d \n 888b._    d8\n 888888   d88\n Y88888  d88P\n   `Y88 dP\"\n      `\"",
  "     .o.\n  „o888888oo„_\n  8b..       /\n d8888887  .8\n 8888888” .8’\n.8888888 .88\n   `Y88P.P”\n       \"`",
  "     .db.\n  „d888888b„\n 888888888888\n 888888888888 \n 888888888888\n Y8888888888P\n   `Y8888P\"\n      `\"",
  "     .\n  .88888bo.„_\n   888888888Y \n   Y88888888”\n   `8888888Y\n     `88888” \n      `Y8P”\n      ",
  "     .db.\n  .d88888b.\n\\``````````.\n Y.       .8.\n `88.    .88b\n  \"Yb   .8888\"\n   `Y. .8P\"\n     ` \"",
  "     .db.\n  „gḡḡḡḡḡḡg„\n b.         d \n 888b._    d8\n 888888   d88\n Y88888  d88P\n   `Y88 dP\"\n      `\"",
  "     .db.\n  „gḡḡḡḡḡḡg„\n b.         d \n 888b._    d8\n 888888   d88\n Y88888  d88P\n   `Y88 dP\"\n      `\"",
  "     .db.\n  „gḡḡḡḡḡḡg„\n b.         d \n 888b._    d8\n 888888   d88\n Y88888  d88P\n   `Y88 dP\"\n      `\""
];

const FRAME_MS = 140;
const PAUSE_MS = 1800;

export default function AuthPanel() {
  const [frameIndex, setFrameIndex] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const frameRef = useRef(0);

  const scheduleNext = useCallback(() => {
    const next = (frameRef.current + 1) % CUBE_FRAMES.length;
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
      className="font-berkeley-mono flex h-full w-full items-center justify-center overflow-hidden"
      style={{
        backgroundColor: "var(--color-theme-bg-muted)",
        color: "var(--color-theme-text-sec)",
      }}
    >
      <div className="flex items-center gap-10">
        {/* ASCII cube */}
        <pre
          className="text-[13px] leading-[1.35]"
          style={{ color: "var(--color-theme-text-ter)" }}
        >
          {CUBE_FRAMES[frameIndex]}
        </pre>

        {/* Auth text — vertically centered to cube */}
        <div className="flex flex-col justify-center gap-3">
          <div>
            <div
              className="text-[13px]"
              style={{ color: "var(--color-theme-text)" }}
            >
              Cursor Agent
            </div>
            <div
              className="text-[13px]"
              style={{ color: "var(--color-theme-text-ter)" }}
            >
              v2026.02.13-41ac335
            </div>
          </div>
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
