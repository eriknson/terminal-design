"use client";

import React, { useState, useEffect, useRef, useLayoutEffect } from "react";

// =============================================================================
// Demo script content
// =============================================================================

const CLI_DEMO_SCRIPT = {
  userPrompt: "plan mission control interface",
  thinkingText: "Planning next moves",
  agentText: "Analyzing project structure for dashboard components.",
  toolCall1: {
    action: "Read, searched",
    detail: "3 files, 1 search",
    files: [
      "Read src/components/Dashboard.tsx",
      "Searched for 'real-time data' in src/",
    ],
  },
  planningText: "Creating plan",
  toolCall2: {
    action: "Read, listed",
    detail: "2 files, 1 directory",
    files: [
      "Read src/hooks/useMetrics.ts",
      "Listed src/components/widgets/",
    ],
  },
  analyzingText: "Analyzing work scope",
  toolCall3: {
    action: "Read, searched",
    detail: "4 files",
    files: [
      "Read src/types/metrics.ts",
      "Read src/api/dataFetcher.ts",
      "Read src/styles/dashboard.css",
    ],
  },
  questions: {
    title: "Question",
    question: "What data should the mission control display?",
    options: ["Real-time metrics", "System status"],
    selectedIndex: 0,
  },
  cloudPrompt: "let's continue in the cloud",
};

// =============================================================================
// Animation phases
// =============================================================================

export type CLIDemoPhase =
  | "idle"
  | "typing"
  | "thinking"
  | "toolCall1"
  | "planning"
  | "toolCall2"
  | "questions"
  | "questionsNav1"
  | "questionsNav2"
  | "selection"
  | "analyzing"
  | "toolCall3"
  | "initializing"
  | "subagents"
  | "cloudTyping"
  | "cloudSaving"
  | "cloudMigrating"
  | "pause";

const PHASE_TIMINGS: Record<CLIDemoPhase, number> = {
  idle: 600,
  typing: 1000,
  thinking: 700,
  toolCall1: 1000,
  planning: 700,
  toolCall2: 1000,
  questions: 700,
  questionsNav1: 500,
  questionsNav2: 500,
  selection: 600,
  analyzing: 700,
  toolCall3: 1000,
  initializing: 800,
  subagents: 2500,
  cloudTyping: 1200,
  cloudSaving: 1200,
  cloudMigrating: 1500,
  pause: 1800,
};

const PHASE_ORDER: CLIDemoPhase[] = [
  "idle",
  "typing",
  "thinking",
  "toolCall1",
  "planning",
  "toolCall2",
  "questions",
  "questionsNav1",
  "questionsNav2",
  "selection",
  "analyzing",
  "initializing",
  "subagents",
  "cloudTyping",
  "cloudSaving",
  "cloudMigrating",
  "pause",
];

const SUBAGENT_TASKS = [
  { name: "subagent-1", title: "Health", model: "Opus-4.6", task: "Building health metrics panel" },
  { name: "subagent-2", title: "Deployments", model: "GPT-5.2 Codex", task: "Creating deployment tracker" },
  { name: "subagent-3", title: "Incidents", model: "Composer-1", task: "Building incident feed" },
];

const BUFFER_STEP_PHASES = [
  "thinking",
  "toolCall1",
  "planning",
  "toolCall2",
  "analyzing",
  "toolCall3",
  "initializing",
] as const;

type BufferStepPhase = (typeof BUFFER_STEP_PHASES)[number];
type BufferStepState = "queued" | "active" | "done";

const BUFFER_STEPS: {
  phase: BufferStepPhase;
  activeLabel: string;
  doneLabel: string;
  detail: string;
}[] = [
  {
    phase: "thinking",
    activeLabel: "Thinking",
    doneLabel: "Thought",
    detail: CLI_DEMO_SCRIPT.thinkingText,
  },
  {
    phase: "toolCall1",
    activeLabel: "Reading",
    doneLabel: "Read",
    detail: CLI_DEMO_SCRIPT.toolCall1.detail,
  },
  {
    phase: "planning",
    activeLabel: "Planning",
    doneLabel: "Planned",
    detail: CLI_DEMO_SCRIPT.planningText,
  },
  {
    phase: "toolCall2",
    activeLabel: "Reading",
    doneLabel: "Read",
    detail: CLI_DEMO_SCRIPT.toolCall2.detail,
  },
  {
    phase: "analyzing",
    activeLabel: "Analyzing",
    doneLabel: "Analyzed",
    detail: CLI_DEMO_SCRIPT.analyzingText,
  },
  {
    phase: "toolCall3",
    activeLabel: "Reading",
    doneLabel: "Read",
    detail: CLI_DEMO_SCRIPT.toolCall3.detail,
  },
  {
    phase: "initializing",
    activeLabel: "Spawning",
    doneLabel: "Started",
    detail: "3 agents",
  },
];

const BUFFER_STEP_PHASE_SET = new Set<CLIDemoPhase>([...BUFFER_STEP_PHASES]);
const PRE_QUESTION_BUFFER_STEPS = BUFFER_STEPS.slice(0, 4);
const POST_QUESTION_BUFFER_STEPS = BUFFER_STEPS.slice(4);

function formatDuration(seconds: number) {
  if (seconds >= 10) return `${Math.round(seconds)}s`;
  return `${seconds.toFixed(1)}s`;
}

// =============================================================================
// CLISpinnerShimmer
// =============================================================================

function CLISpinnerShimmer({
  done = false,
  syncTick,
  color = "green",
}: {
  done?: boolean;
  syncTick?: number;
  color?: "green" | "purple";
}) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (done || syncTick !== undefined) return;
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % 6);
    }, 80);
    return () => clearInterval(interval);
  }, [done, syncTick]);

  const effectiveFrame = syncTick !== undefined ? syncTick : frame;
  const hexGlyph = done
    ? "⬢"
    : Math.floor(effectiveFrame / 3) % 2 === 0
      ? "⬢"
      : "⬡";

  const colorStyle = done
    ? "var(--color-theme-border-02)"
    : color === "purple"
      ? "#a78bfa"
      : "#4ade80";

  return (
    <span style={{ color: colorStyle, position: "relative", top: "-1px" }}>
      {hexGlyph}
    </span>
  );
}

function CLIStatusGlyph({
  state,
  syncTick,
}: {
  state: BufferStepState;
  syncTick: number;
}) {
  if (state === "active") {
    return <CLISpinnerShimmer syncTick={syncTick} />;
  }

  const glyph = state === "done" ? "⬢" : "⬡";
  const colorStyle =
    state === "done"
      ? "var(--color-theme-text-sec)"
      : "var(--color-theme-text-ter)";

  return (
    <span style={{ color: colorStyle, position: "relative", top: "-1px" }}>
      {glyph}
    </span>
  );
}

// =============================================================================
// AnimatedAgentCLIPanel
// =============================================================================

export default function AnimatedAgentCLIPanel({
  loop = true,
  startPhase = "idle",
  endPhase,
  showPriorState = false,
}: {
  loop?: boolean;
  startPhase?: CLIDemoPhase;
  endPhase?: CLIDemoPhase;
  showPriorState?: boolean;
}) {
  const [phase, setPhase] = useState<CLIDemoPhase>(startPhase);
  const [typedText, setTypedText] = useState(
    showPriorState && PHASE_ORDER.indexOf(startPhase) > PHASE_ORDER.indexOf("typing")
      ? CLI_DEMO_SCRIPT.userPrompt
      : ""
  );
  const [cloudTypedText, setCloudTypedText] = useState("");
  const [syncTick, setSyncTick] = useState(0);
  const [stepDurations, setStepDurations] = useState<
    Partial<Record<BufferStepPhase, number>>
  >({});
  const [activeStepElapsedMs, setActiveStepElapsedMs] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [phase]);

  const phaseIndex = PHASE_ORDER.indexOf(phase);
  const startIndex = PHASE_ORDER.indexOf(startPhase);

  // Sync tick animation for subagents
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncTick((t) => (t + 1) % 6);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!BUFFER_STEP_PHASE_SET.has(phase)) {
      setActiveStepElapsedMs(0);
      return;
    }

    const startedAt = Date.now();
    setActiveStepElapsedMs(0);

    const interval = setInterval(() => {
      setActiveStepElapsedMs(Date.now() - startedAt);
    }, 100);

    return () => clearInterval(interval);
  }, [phase]);

  // Phase progression with duration tracking
  useEffect(() => {
    // If we've reached the endPhase and not looping, stay here
    if (endPhase && phase === endPhase && !loop) return;

    const timing = PHASE_TIMINGS[phase];
    const startTime = Date.now();

    const timer = setTimeout(() => {
      const elapsed = Date.now() - startTime;
      const durationSec = Math.max(elapsed / 1000, 0.1);

      if (BUFFER_STEP_PHASE_SET.has(phase)) {
        setStepDurations((prev) => ({
          ...prev,
          [phase]: durationSec,
        }));
      }

      const nextIndex = phaseIndex + 1;

      // If we've reached (just finished) endPhase, loop back to startPhase or stop
      if (endPhase && phase === endPhase) {
        if (loop) {
          resetState();
          setPhase(startPhase);
        }
        return;
      }

      if (nextIndex < PHASE_ORDER.length) {
        setPhase(PHASE_ORDER[nextIndex]);
      } else if (loop) {
        resetState();
        setPhase(startPhase);
      }
    }, timing);
    return () => clearTimeout(timer);
  }, [phase, phaseIndex, loop, startPhase, endPhase]);

  function resetState() {
    if (showPriorState && startIndex > PHASE_ORDER.indexOf("typing")) {
      setTypedText(CLI_DEMO_SCRIPT.userPrompt);
    } else {
      setTypedText("");
    }
    setCloudTypedText("");
    setStepDurations({});
    setActiveStepElapsedMs(0);
  }

  // Typing animation for user prompt
  useEffect(() => {
    if (phase !== "typing") return;
    const text = CLI_DEMO_SCRIPT.userPrompt;
    let i = 0;
    setTypedText("");
    const interval = setInterval(() => {
      if (i < text.length) {
        setTypedText(text.slice(0, i + 1));
        i++;
      } else clearInterval(interval);
    }, PHASE_TIMINGS.typing / text.length);
    return () => clearInterval(interval);
  }, [phase]);

  // Typing animation for cloud prompt
  useEffect(() => {
    if (phase !== "cloudTyping") return;
    const text = CLI_DEMO_SCRIPT.cloudPrompt;
    let i = 0;
    setCloudTypedText("");
    const interval = setInterval(() => {
      if (i < text.length) {
        setCloudTypedText(text.slice(0, i + 1));
        i++;
      } else clearInterval(interval);
    }, PHASE_TIMINGS.cloudTyping / text.length);
    return () => clearInterval(interval);
  }, [phase]);

  // Subagent stagger animation
  const [visibleSubagents, setVisibleSubagents] = useState(0);
  const [subagentPhases, setSubagentPhases] = useState<number[]>([0, 0, 0]);

  const getContextAndFiles = () => {
    const phaseContextMap: Record<
      CLIDemoPhase,
      { context: number; files: number }
    > = {
      idle: { context: 0, files: 0 },
      typing: { context: 1, files: 0 },
      thinking: { context: 2, files: 0 },
      toolCall1: { context: 3, files: 0 },
      planning: { context: 4, files: 0 },
      toolCall2: { context: 5, files: 0 },
      questions: { context: 5, files: 0 },
      questionsNav1: { context: 5, files: 0 },
      questionsNav2: { context: 5, files: 0 },
      selection: { context: 6, files: 0 },
      analyzing: { context: 7, files: 0 },
      toolCall3: { context: 7, files: 0 },
      initializing: { context: 8, files: 0 },
      subagents: { context: 8, files: 2 },
      cloudTyping: { context: 8, files: 4 },
      cloudSaving: { context: 8, files: 5 },
      cloudMigrating: { context: 8, files: 5 },
      pause: { context: 8, files: 5 },
    };
    return phaseContextMap[phase] || { context: 0, files: 0 };
  };
  const { context: contextPercent, files: filesEdited } = getContextAndFiles();

  useEffect(() => {
    if (phase !== "subagents") {
      setVisibleSubagents(0);
      setSubagentPhases([0, 0, 0]);
      return;
    }
    let i = 0;
    const appearInterval = setInterval(() => {
      if (i < SUBAGENT_TASKS.length) {
        setVisibleSubagents(i + 1);
        i++;
      } else {
        clearInterval(appearInterval);
      }
    }, 200);

    const transitionTimeouts: ReturnType<typeof setTimeout>[] = [];
    SUBAGENT_TASKS.forEach((_, idx) => {
      const timeout = setTimeout(() => {
        setSubagentPhases((prev) => {
          const next = [...prev];
          next[idx] = 1;
          return next;
        });
      }, 200 * (idx + 1) + 600);
      transitionTimeouts.push(timeout);
    });

    return () => {
      clearInterval(appearInterval);
      transitionTimeouts.forEach((t) => clearTimeout(t));
    };
  }, [phase]);

  // Phase states
  const isIdle = phase === "idle";
  const isTyping = phase === "typing";
  const isQuestions = phase === "questions";
  const isQuestionsNav1 = phase === "questionsNav1";
  const isQuestionsNav2 = phase === "questionsNav2";
  const isSelection = phase === "selection";
  const isSubagents = phase === "subagents";
  const isCloudTyping = phase === "cloudTyping";
  const isCloudSaving = phase === "cloudSaving";
  const isCloudMigrating = phase === "cloudMigrating";
  const isPause = phase === "pause";

  const showMode = !isIdle || (showPriorState && startIndex > 0);
  const isCloudMode =
    isCloudTyping || isCloudSaving || isCloudMigrating || isPause;

  const isPast = (p: CLIDemoPhase) => {
    const pi = PHASE_ORDER.indexOf(p);
    if (phaseIndex > pi) return true;
    if (showPriorState && pi < startIndex) return true;
    return false;
  };

  const pastTyping = isPast("typing");
  const pastQuestions = isPast("questions");
  const pastSelection = isPast("selection");
  const pastInitializing = isPast("initializing");
  const pastCloudTyping = isPast("cloudTyping");

  const getFocusedOption = () => {
    if (isQuestions) return 0;
    if (isQuestionsNav1) return 1;
    if (isQuestionsNav2) return 0;
    return CLI_DEMO_SCRIPT.questions.selectedIndex;
  };
  const focusedOption = getFocusedOption();
  const isNavigating = isQuestions || isQuestionsNav1 || isQuestionsNav2;

  const planGreen = "#4ade80";
  const cloudLavender = "#a78bfa";

  const getInput = (): {
    prefix: string | null;
    text: string;
    dim: boolean;
    right?: string;
  } => {
    if (isIdle)
      return {
        prefix: "→",
        text: "Plan, search, build anything",
        dim: true,
      };
    if (isTyping)
      return { prefix: null, text: typedText, dim: false };
    if (isCloudTyping)
      return { prefix: "&", text: cloudTypedText, dim: false };
    if (pastCloudTyping)
      return {
        prefix: "→",
        text: "Ask, plan, build anything",
        dim: true,
      };
    return {
      prefix: "→",
      text: "Add a follow-up",
      dim: true,
      right: "esc to stop",
    };
  };
  const input = getInput();

  const getBufferStepState = (bufferPhase: BufferStepPhase): BufferStepState => {
    if (phase === bufferPhase) return "active";
    if (isPast(bufferPhase)) return "done";
    return "queued";
  };

  const getStepDuration = (bufferPhase: BufferStepPhase) =>
    stepDurations[bufferPhase] ?? PHASE_TIMINGS[bufferPhase] / 1000;

  const renderBufferStep = (step: (typeof BUFFER_STEPS)[number]) => {
    const state = getBufferStepState(step.phase);
    const isActive = state === "active";
    const isDone = state === "done";
    const progressPercent = isActive
      ? Math.min((activeStepElapsedMs / PHASE_TIMINGS[step.phase]) * 100, 100)
      : 0;

    return (
      <div
        key={step.phase}
        className="flex items-start gap-2 rounded-[6px] px-2 py-1.5 transition-opacity"
        style={{
          opacity: state === "queued" ? 0.5 : 1,
          backgroundColor: isActive
            ? "rgba(255,255,255,0.03)"
            : "transparent",
        }}
      >
        <CLIStatusGlyph state={state} syncTick={syncTick} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div
                style={{
                  color: isActive
                    ? "var(--color-theme-text)"
                    : isDone
                      ? "var(--color-theme-text-sec)"
                      : "var(--color-theme-text-ter)",
                }}
              >
                {isActive ? step.activeLabel : isDone ? step.doneLabel : step.activeLabel}
              </div>
              <div
                className="truncate"
                style={{
                  color: isDone
                    ? "var(--color-theme-text-ter)"
                    : "var(--color-theme-text-sec)",
                }}
              >
                {step.detail}
              </div>
            </div>
            <span
              className="whitespace-nowrap"
              style={{ color: "var(--color-theme-text-ter)", opacity: 0.75 }}
            >
              {isActive
                ? `${Math.round(progressPercent)}%`
                : isDone
                  ? formatDuration(getStepDuration(step.phase))
                  : "Queued"}
            </span>
          </div>
          {isActive && (
            <div
              className="mt-1.5 h-px w-full overflow-hidden rounded-full"
              style={{ backgroundColor: "var(--color-theme-border-02)" }}
            >
              <div
                className="h-full rounded-full transition-[width] duration-100"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: planGreen,
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="font-berkeley-mono flex h-full w-full flex-col overflow-hidden text-[12px]"
      style={{
        backgroundColor: "var(--color-theme-bg-muted)",
        color: "var(--color-theme-text-sec)",
      }}
    >
      {/* Content area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pt-4 pb-2">
        <div className="space-y-2.5">
          {/* Header */}
          <div className="space-y-0.5 pb-1">
            <div>
              <span style={{ color: "var(--color-theme-text-ter)" }}>&gt; </span>
              <span style={{ color: "var(--color-theme-text-sec)" }}>agent</span>
            </div>
            <div style={{ color: "var(--color-theme-text-ter)" }}>
              Cursor Agent
            </div>
            <div style={{ color: "var(--color-theme-text-ter)", opacity: 0.6 }}>
              ~/anysphere/research · main
            </div>
          </div>

          {/* User prompt box */}
          {pastTyping && (
            <div
              className="border px-3 py-2"
              style={{
                borderColor: "var(--color-theme-border-02)",
                color: "var(--color-theme-text)",
              }}
            >
              {CLI_DEMO_SCRIPT.userPrompt}
            </div>
          )}

          {/* Buffer of loading steps */}
          <div className="space-y-2">
            {pastTyping && PRE_QUESTION_BUFFER_STEPS.map(renderBufferStep)}

            {/* Questions */}
            {(isNavigating || pastQuestions) && (
              <div
                className="space-y-1.5 border p-2.5"
                style={{ borderColor: "var(--color-theme-border-02)" }}
              >
                <div style={{ color: "var(--color-theme-text-sec)" }}>
                  {CLI_DEMO_SCRIPT.questions.title}
                </div>
                <div style={{ color: "var(--color-theme-text)" }}>
                  {CLI_DEMO_SCRIPT.questions.question}
                </div>
                <div className="space-y-0.5">
                  {CLI_DEMO_SCRIPT.questions.options.map((opt, i) => {
                    const isSelectedOption =
                      CLI_DEMO_SCRIPT.questions.selectedIndex === i;
                    const showSelected =
                      (isSelection || pastSelection) && isSelectedOption;
                    const isFocused = isNavigating && focusedOption === i;
                    return (
                      <div
                        key={i}
                        className="flex items-center transition-colors duration-150"
                        style={{
                          color:
                            isFocused || showSelected
                              ? "var(--color-theme-text)"
                              : "var(--color-theme-text-ter)",
                        }}
                      >
                        <span
                          className="w-4"
                          style={{ color: "var(--color-theme-text)" }}
                        >
                          {isFocused ? ">" : ""}
                        </span>
                        <span>
                          {showSelected ? "[x]" : "[ ]"} {opt}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {pastTyping && POST_QUESTION_BUFFER_STEPS.map(renderBufferStep)}

            {/* Subagents */}
            {pastInitializing && (
              <div className="space-y-2 pl-4">
                {SUBAGENT_TASKS.map((agent, i) => {
                  if (isSubagents && i >= visibleSubagents) return null;

                  const getTaskText = () => {
                    if (isCloudMigrating || isPause) return "Moving to cloud";
                    if (isCloudSaving) return "Saving state";
                    if (isSubagents && subagentPhases[i] === 0)
                      return "Planning";
                    return agent.task;
                  };

                  const spinnerColor =
                    isCloudSaving || isCloudMigrating || isPause
                      ? ("purple" as const)
                      : ("green" as const);

                  return (
                    <div key={i} className="flex items-start gap-2">
                      <CLISpinnerShimmer
                        syncTick={syncTick}
                        color={spinnerColor}
                      />
                      <div className="min-w-0 flex-1">
                        <span style={{ color: "var(--color-theme-text)" }}>
                          {agent.title}
                        </span>
                        <span style={{ color: "var(--color-theme-text-sec)" }}>
                          {" "}
                          · {getTaskText()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed bottom section */}
      <div
        className="flex-shrink-0 space-y-2 px-4 pt-2 pb-4"
        style={{ backgroundColor: "var(--color-theme-bg-muted)" }}
      >
        {/* Input box */}
        <div
          className="border px-3 py-2 transition-colors duration-200"
          style={{
            borderColor: isCloudTyping
              ? cloudLavender
              : isTyping
                ? planGreen
                : "var(--color-theme-border-02)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {input.prefix && (
                <span
                  style={{
                    color: isCloudMode
                      ? cloudLavender
                      : "var(--color-theme-text-ter)",
                  }}
                >
                  {input.prefix}
                </span>
              )}
              <span
                style={{
                  color: input.dim
                    ? "var(--color-theme-text-ter)"
                    : "var(--color-theme-text)",
                }}
              >
                {input.text}
              </span>
              {(isTyping || isCloudTyping) && (
                <span
                  className="animate-pulse"
                  style={{
                    width: "2px",
                    height: "13px",
                    backgroundColor: "var(--color-theme-text)",
                    display: "inline-block",
                  }}
                />
              )}
            </div>
            {input.right && (
              <span style={{ color: "var(--color-theme-text-ter)" }}>
                {input.right}
              </span>
            )}
          </div>
        </div>

        {/* Mode indicator */}
        {showMode && (
          <div
            className="flex items-center gap-1.5"
            style={{ color: isCloudMode ? cloudLavender : planGreen }}
          >
            <span>◉</span>
            <span>
              {isCloudMode
                ? "Move to cloud agent"
                : "Plan (shift+tab to cycle)"}
            </span>
          </div>
        )}

        {/* Model and stats bar */}
        <div
          className="flex items-center gap-1"
          style={{ color: "var(--color-theme-text-ter)" }}
        >
          <span style={{ color: "var(--color-theme-text-sec)" }}>
            GPT-5.2 Codex Extra High Fast
          </span>
          {showMode && (
            <>
              <span style={{ opacity: 0.5 }}>·</span>
              <span>{contextPercent}%</span>
              {filesEdited > 0 && (
                <>
                  <span style={{ opacity: 0.5 }}>·</span>
                  <span>
                    {filesEdited} {filesEdited === 1 ? "file" : "files"} edited
                  </span>
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ color: "var(--color-theme-text-ter)" }}>
          <span style={{ color: "var(--color-theme-text-sec)" }}>/</span>{" "}
          commands <span style={{ opacity: 0.5 }}>·</span>{" "}
          <span style={{ color: "var(--color-theme-text-sec)" }}>@</span>{" "}
          files <span style={{ opacity: 0.5 }}>·</span>{" "}
          <span style={{ color: "var(--color-theme-text-sec)" }}>!</span>{" "}
          shell
        </div>
      </div>
    </div>
  );
}
