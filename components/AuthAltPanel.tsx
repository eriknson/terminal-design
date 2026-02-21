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

const AGENT_TEXT = "agent";
const PROMPT_TEXT = "Press any key to authenticate...";

const SCRAMBLE_CHARS =
  "!<>-_\\/[]{}=+*^?#0123456789abcdef";
const SCRAMBLE_TICK = 40;
const SCRAMBLE_TICKS = 16;

const FRAME_DELAYS = [
  1800, // 0: rest pause before next cycle
  160,  // 1: ease in
  120,  // 2: accelerating
  100,  // 3: peak speed
  120,  // 4: decelerating
  160,  // 5: ease out
  200,  // 6: settling
  200,  // 7: holding rest
];

const ENTRANCE = {
  agentStart: 200,
  agentChar: 55,
  scrambleDelay: 150,
  promptDelay: 200,
  promptChar: 18,
};

function randomChar() {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
}

export default function AuthAltPanel() {
  const [agentChars, setAgentChars] = useState(0);
  const [lockupText, setLockupText] = useState<string | null>(null);
  const [promptChars, setPromptChars] = useState(0);
  const [entranceDone, setEntranceDone] = useState(false);

  const [frameIndex, setFrameIndex] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const ids: ReturnType<typeof setTimeout>[] = [];
    let t = ENTRANCE.agentStart;

    for (let i = 1; i <= AGENT_TEXT.length; i++) {
      const n = i;
      ids.push(setTimeout(() => setAgentChars(n), t));
      t += ENTRANCE.agentChar;
    }

    t += ENTRANCE.scrambleDelay;

    const target = LOCKUP_FRAMES[0];
    const contentIndices = [...target]
      .map((c, i) => ({ c, i }))
      .filter(({ c }) => c.trim().length > 0)
      .map(({ i }) => i);

    const order = [...contentIndices].sort(
      (a, b) => ((a * 2654435761) >>> 0) - ((b * 2654435761) >>> 0)
    );

    const resolvePerTick = Math.ceil(order.length / SCRAMBLE_TICKS);
    const resolved = new Set<number>();

    for (let tick = 0; tick <= SCRAMBLE_TICKS; tick++) {
      const currentTick = tick;
      ids.push(
        setTimeout(() => {
          if (currentTick > 0) {
            const start = (currentTick - 1) * resolvePerTick;
            const end = Math.min(start + resolvePerTick, order.length);
            for (let j = start; j < end; j++) resolved.add(order[j]);
          }
          setLockupText(
            [...target]
              .map((c, i) => {
                if (c.trim().length === 0) return c;
                if (resolved.has(i)) return c;
                return randomChar();
              })
              .join("")
          );
        }, t + currentTick * SCRAMBLE_TICK)
      );
    }

    const scrambleEnd = t + (SCRAMBLE_TICKS + 1) * SCRAMBLE_TICK;
    ids.push(setTimeout(() => setLockupText(target), scrambleEnd));

    let pt = t + 4 * SCRAMBLE_TICK;
    for (let i = 1; i <= PROMPT_TEXT.length; i++) {
      const n = i;
      ids.push(setTimeout(() => setPromptChars(n), pt));
      pt += ENTRANCE.promptChar;
    }

    const doneAt = Math.max(scrambleEnd, pt);
    ids.push(setTimeout(() => setEntranceDone(true), doneAt));
    return () => ids.forEach(clearTimeout);
  }, []);

  const scheduleNext = useCallback(() => {
    const next = (frameRef.current + 1) % LOCKUP_FRAMES.length;
    const delay = FRAME_DELAYS[next];
    timeoutRef.current = setTimeout(() => {
      frameRef.current = next;
      setFrameIndex(next);
      scheduleNext();
    }, delay);
  }, []);

  useEffect(() => {
    if (!entranceDone) return;
    scheduleNext();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [entranceDone, scheduleNext]);

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
            <span style={{ color: "var(--color-theme-text)" }}>
              {AGENT_TEXT.slice(0, agentChars)}
            </span>
            {lockupText === null && (
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
            )}
          </div>

          {/* Horizontal lockup */}
          {lockupText !== null && (
            <pre
              className="text-[11px] leading-[1.35] my-6"
              style={{
                color: "var(--color-theme-text-sec)",
                marginLeft: "-0.75ch",
              }}
            >
              {entranceDone ? LOCKUP_FRAMES[frameIndex] : lockupText}
            </pre>
          )}

          {/* Press any key */}
          {promptChars > 0 && (
            <div
              className="text-[13px]"
              style={{ color: "var(--color-theme-text)" }}
            >
              {PROMPT_TEXT.slice(0, promptChars)}
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
          )}
        </div>
      </div>
    </div>
  );
}
