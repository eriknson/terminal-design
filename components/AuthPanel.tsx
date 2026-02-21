"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

// Exact same frames as AuthPanelHighFps
const CUBE_FRAMES: string[] = [
  "     .db.\n  „gḡḡḡḡḡḡg„\n b.         d \n 888b._    d8\n 888888   d88\n Y88888  d88P\n   `Y88 dP\"\n      `\"",
  "     .ob.\n  „go88gg88o„\n  b..        d\n 888b._    .8\n 888888   .88\n Y88888  .88P\n   `Y88 .P\"\n      `\"",
  "     .o.\n  „o888888oo„_\n  8b..       /\n d8888887  .8\n 8888888\" .8'\n.8888888 .88\n   `Y88P.P\"\n       \"`",
  "     .od.\n  „o888888b„\n d88888...  /\n d8888888  .8\n 88888888 .88\n Y8888888 .88\n   `Y888.P\"\n       \"`",
  "     .db.\n  „d888888b„\n 888888888888\n 888888888888 \n 888888888888\n Y8888888888P\n   `Y8888P\"\n      `\"",
  "     .d.\n  „d88888b„_\n  88888888888\n  8888888888Y\n  Y888888888\n   Y8888888P\n    `Y888P\"\n       `",
  "     .\n  .88888bo.„_\n   888888888Y \n   Y88888888\"\n   `8888888Y\n     `88888\" \n      `Y8P\"\n      ",
  "     .d.\n  .d88888b.\n\\ .8888888.\n Y.   .8888.\n `88.  .8888\n  `Y8   .888\"\n   `Y. .8P\"\n     ` \"",
  "     .db.\n  .d88888b.\n\\``````````.\n Y.       .8.\n `88.    .88b\n  \"Yb   .8888\"\n   `Y. .8P\"\n     ` \"",
  "     .db.\n  .d`g`8`g`b.\n\\ Y.       .d\n `8.      .d8\n \"8b.    .d88\n  Y8.    d88P\n   `Y.  dP\"\n      `\"",
  "     .db.\n  „g`gg`gg`g„\n Yb.        d\n `88b.     d8\n  8888.   d88\n  Y8888  d88P\n   `Y88 dP\"\n      `\"",
  "     .db.\n  „gḡḡḡḡḡḡg„\n b.         d \n 888b._    d8\n 888888   d88\n Y88888  d88P\n   `Y88 dP\"\n      `\"",
  "     .db.\n  „gḡḡḡḡḡḡg„\n b.         d \n 888b._    d8\n 888888   d88\n Y88888  d88P\n   `Y88 dP\"\n      `\"",
  "     .db.\n  „gḡḡḡḡḡḡg„\n b.         d \n 888b._    d8\n 888888   d88\n Y88888  d88P\n   `Y88 dP\"\n      `\"",
  "     .db.\n  „gḡḡḡḡḡḡg„\n b.         d \n 888b._    d8\n 888888   d88\n Y88888  d88P\n   `Y88 dP\"\n      `\"",
  "     .db.\n  „gḡḡḡḡḡḡg„\n b.         d \n 888b._    d8\n 888888   d88\n Y88888  d88P\n   `Y88 dP\"\n      `\"",
  "     .db.\n  „gḡḡḡḡḡḡg„\n b.         d \n 888b._    d8\n 888888   d88\n Y88888  d88P\n   `Y88 dP\"\n      `\"",
  "     .db.\n  „gḡḡḡḡḡḡg„\n b.         d \n 888b._    d8\n 888888   d88\n Y88888  d88P\n   `Y88 dP\"\n      `\""
];

const FRAME_MS = 70;
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
            <span style={{ color: "var(--color-theme-text)" }}>agent</span>
          </div>

          {/* Cube + title in bordered container */}
          <div
            className="my-3 border p-4"
            style={{ borderColor: "var(--color-theme-border-02)" }}
          >
            <div className="flex items-center gap-0">
              <pre
                className="text-[13px] leading-[1.35]"
                style={{
                  color: "var(--color-theme-text-ter)",
                  width: "18ch",
                  display: "inline-block",
                  textAlign: "left",
                }}
              >
                {CUBE_FRAMES[frameIndex]}
              </pre>

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
                  v2026.02.13-41ac335 ·{" "}
                  <a
                    href="https://cursor.com/changelog"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "inherit" }}
                  >
                    Changelog
                  </a>
                </div>

                <div className="mt-2 flex flex-col gap-0.5 text-[13px]">
                  <a
                    href="https://cursor.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--color-theme-accent)" }}
                  >
                    Learn more{"\u2004"}↗
                  </a>
                  <a
                    href="https://docs.cursor.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--color-theme-accent)" }}
                  >
                    Documentation{"\u2004"}↗
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Press any key */}
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
