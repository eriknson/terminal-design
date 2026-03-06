import type { CLIDemoPhase } from "@/components/AnimatedAgentCLIPanel";

export type ScenarioSectionId =
  | "overview"
  | "prompting"
  | "reasoning"
  | "clarification"
  | "delegation"
  | "cloud"
  | "auth";

export type ScenarioSection = {
  id: ScenarioSectionId;
  label: string;
  description: string;
};

export type Scenario = {
  slug: string;
  label: string;
  title: string;
  summary: string;
  howItWorks: string[];
  section: ScenarioSectionId;
  /** When "custom", the ScenarioPage renders customContent instead of AnimatedAgentCLIPanel */
  type?: "phase" | "custom";
  startPhase?: CLIDemoPhase;
  endPhase?: CLIDemoPhase;
  loop?: boolean;
  showPriorState?: boolean;
};

export const DEFAULT_SCENARIO_SLUG = "full-loop";

export const SCENARIO_SECTIONS: ScenarioSection[] = [
  {
    id: "overview",
    label: "Overview",
    description: "End-to-end flows that show the full terminal story.",
  },
  {
    id: "prompting",
    label: "Prompting",
    description: "The starting states before the agent begins work.",
  },
  {
    id: "reasoning",
    label: "Reasoning and tools",
    description: "Planning, reading context, and scoping the task.",
  },
  {
    id: "clarification",
    label: "Clarification",
    description: "Question states, navigation, and final answer selection.",
  },
  {
    id: "delegation",
    label: "Delegation",
    description: "Spawning subagents and showing parallel execution.",
  },
  {
    id: "cloud",
    label: "Cloud handoff",
    description: "Moving work from the local terminal to the cloud agent.",
  },
  {
    id: "auth",
    label: "Auth",
    description: "Authentication and startup variants for the terminal shell.",
  },
];

export const PHASE_LABELS: Record<CLIDemoPhase, string> = {
  idle: "Idle",
  typing: "Typing",
  thinking: "Thinking",
  toolCall1: "Initial read",
  planning: "Planning",
  toolCall2: "Second read",
  questions: "Question",
  questionsNav1: "Question navigation",
  questionsNav2: "Question navigation",
  selection: "Selection",
  analyzing: "Analysis",
  toolCall3: "Final read",
  initializing: "Agent spawn",
  subagents: "Multi-agent work",
  cloudTyping: "Cloud prompt",
  cloudSaving: "Saving state",
  cloudMigrating: "Cloud migration",
  pause: "Cloud ready",
};

export const SCENARIOS: Scenario[] = [
  {
    slug: "full-loop",
    label: "Full loop",
    title: "Full Cursor Agent terminal loop",
    summary:
      "Runs the complete mock terminal flow from an empty composer through planning, delegation, and cloud handoff.",
    howItWorks: [
      "Starts with the idle terminal and types the prompt into the composer.",
      "Reads context, plans the work, asks a clarifying question, and applies the selected answer.",
      "Spawns subagents, finishes execution, and then moves the session into the cloud.",
    ],
    section: "overview",
    startPhase: "idle",
    loop: true,
    showPriorState: false,
  },
  {
    slug: "idle",
    label: "Idle",
    title: "Idle terminal composer",
    summary:
      "Shows the default empty terminal state before the user begins a request.",
    howItWorks: [
      "The window opens on a quiet terminal with the input placeholder visible.",
      "No prior context is rendered, so the terminal starts from a clean slate.",
      "This is the baseline state the rest of the scenarios build from.",
    ],
    section: "prompting",
    startPhase: "idle",
    endPhase: "idle",
    loop: false,
    showPriorState: false,
  },
  {
    slug: "typing",
    label: "Typing",
    title: "Prompt typing",
    summary:
      "Animates the user request entering the terminal composer character by character.",
    howItWorks: [
      "Begins from an empty composer and reveals the prompt over time.",
      "Keeps the terminal focused on input rather than showing earlier work.",
      "Loops so the typing motion can be inspected repeatedly.",
    ],
    section: "prompting",
    startPhase: "typing",
    endPhase: "typing",
    loop: true,
    showPriorState: false,
  },
  {
    slug: "thinking",
    label: "Thinking",
    title: "Initial thinking state",
    summary:
      "Puts the terminal into the first reasoning step after the prompt has been submitted.",
    howItWorks: [
      "Seeds the terminal with the already-submitted user prompt.",
      "Shows the active thinking row with a live spinner and muted completed context above it.",
      "Loops as an active state so the terminal reads like the agent is still working.",
    ],
    section: "reasoning",
    startPhase: "thinking",
    endPhase: "thinking",
    loop: true,
    showPriorState: true,
  },
  {
    slug: "initial-read",
    label: "Initial read",
    title: "First context read",
    summary:
      "Simulates the first round of file reads and search activity after the agent starts investigating.",
    howItWorks: [
      "Carries forward the submitted prompt and the completed thinking row.",
      "Shows the first tool call as a live read step with file details beneath it.",
      "Loops so the tool activity remains inspectable instead of collapsing into a static snapshot.",
    ],
    section: "reasoning",
    startPhase: "toolCall1",
    endPhase: "toolCall1",
    loop: true,
    showPriorState: true,
  },
  {
    slug: "planning",
    label: "Planning",
    title: "Plan creation",
    summary:
      "Represents the moment the agent turns gathered context into a concrete execution plan.",
    howItWorks: [
      "Keeps the earlier prompt and read step visible as completed context.",
      "Elevates the planning row into the current active state with the live spinner.",
      "Loops as an in-progress planning state rather than freezing on a final output.",
    ],
    section: "reasoning",
    startPhase: "planning",
    endPhase: "planning",
    loop: true,
    showPriorState: true,
  },
  {
    slug: "second-read",
    label: "Second read",
    title: "Second context pass",
    summary:
      "Shows the additional reads and directory inspection that happen after the first draft plan.",
    howItWorks: [
      "Retains the earlier thought, read, and plan rows so the flow feels continuous.",
      "Activates the second tool call with its own file list and status line.",
      "Loops as a working state to make the second pass feel distinct from the first read.",
    ],
    section: "reasoning",
    startPhase: "toolCall2",
    endPhase: "toolCall2",
    loop: true,
    showPriorState: true,
  },
  {
    slug: "questions",
    label: "Question",
    title: "Clarifying question",
    summary:
      "Pauses the terminal to ask the user a targeted follow-up before implementation continues.",
    howItWorks: [
      "Restores the earlier context so the question appears in the middle of a real workflow.",
      "Renders the question card with both answer options visible in the terminal body.",
      "Stops on the initial question state to make the prompt easy to review.",
    ],
    section: "clarification",
    startPhase: "questions",
    endPhase: "questions",
    loop: false,
    showPriorState: true,
  },
  {
    slug: "question-navigation",
    label: "Question navigation",
    title: "Question option navigation",
    summary:
      "Demonstrates the keyboard focus moving between available clarification options.",
    howItWorks: [
      "Uses the same question card as the base clarification state.",
      "Moves focus between options so users can inspect how the selector behaves.",
      "Loops over the navigation phases to keep the interaction observable.",
    ],
    section: "clarification",
    startPhase: "questionsNav1",
    endPhase: "questionsNav2",
    loop: true,
    showPriorState: true,
  },
  {
    slug: "selection",
    label: "Selection",
    title: "Clarification selected",
    summary:
      "Shows the chosen clarification answer committed into the terminal flow.",
    howItWorks: [
      "Preserves the earlier question card so the chosen answer has full context.",
      "Marks the selected option and ends the clarification step.",
      "Holds on the committed state to show what the terminal looks like right before the next analysis step.",
    ],
    section: "clarification",
    startPhase: "selection",
    endPhase: "selection",
    loop: false,
    showPriorState: true,
  },
  {
    slug: "analyzing",
    label: "Analyzing",
    title: "Scope analysis",
    summary:
      "Represents the post-clarification analysis pass before deeper implementation work begins.",
    howItWorks: [
      "Keeps the prompt, tool calls, question, and selected answer visible.",
      "Promotes the analysis row into the active terminal state with a spinner.",
      "Loops as a live state so the terminal still feels mid-flight.",
    ],
    section: "reasoning",
    startPhase: "analyzing",
    endPhase: "analyzing",
    loop: true,
    showPriorState: true,
  },
  {
    slug: "final-read",
    label: "Final read",
    title: "Final implementation read",
    summary:
      "Surfaces the last read step before the primary agent fans work out to specialists.",
    howItWorks: [
      "Brings forward the full upstream context including the completed analysis row.",
      "Shows the third read block with its own file list so the missing implementation-read state is now explorable.",
      "Loops as an active tool phase to make the pre-delegation handoff legible.",
    ],
    section: "reasoning",
    startPhase: "toolCall3",
    endPhase: "toolCall3",
    loop: true,
    showPriorState: true,
  },
  {
    slug: "initializing",
    label: "Agent spawn",
    title: "Subagent initialization",
    summary:
      "Captures the primary agent as it starts the specialist subagents.",
    howItWorks: [
      "Keeps all prior context visible so the spawn step reads as a continuation of the task.",
      "Sets the initializing row as the active terminal state.",
      "Loops while the terminal is still actively spinning up the delegated work.",
    ],
    section: "delegation",
    startPhase: "initializing",
    endPhase: "initializing",
    loop: true,
    showPriorState: true,
  },
  {
    slug: "multi-agent",
    label: "Multi-agent",
    title: "Parallel subagent execution",
    summary:
      "Shows the three delegated subagents running in parallel inside the terminal.",
    howItWorks: [
      "Starts after initialization so the subagents appear as already-spawned workers.",
      "Animates the staggered reveal of each subagent row and their ongoing tasks.",
      "Loops so the parallel execution rhythm stays visible for inspection.",
    ],
    section: "delegation",
    startPhase: "subagents",
    endPhase: "subagents",
    loop: true,
    showPriorState: true,
  },
  {
    slug: "cloud-typing",
    label: "Cloud prompt",
    title: "Continue-in-cloud prompt",
    summary:
      "Shows the local terminal typing the request that moves the session into the cloud agent.",
    howItWorks: [
      "Begins after the subagent stage so the session already feels established.",
      "Animates the cloud follow-up prompt in the input field.",
      "Loops as an active handoff request rather than a frozen final state.",
    ],
    section: "cloud",
    startPhase: "cloudTyping",
    endPhase: "cloudTyping",
    loop: true,
    showPriorState: true,
  },
  {
    slug: "cloud-saving",
    label: "Saving state",
    title: "Saving state for cloud migration",
    summary:
      "Shows the terminal capturing context before the work is migrated to the cloud agent.",
    howItWorks: [
      "Keeps the delegated subagents visible so the save step feels grounded in the active session.",
      "Updates each subagent row to the cloud save behavior.",
      "Loops as a transition state that users can inspect without racing the animation.",
    ],
    section: "cloud",
    startPhase: "cloudSaving",
    endPhase: "cloudSaving",
    loop: true,
    showPriorState: true,
  },
  {
    slug: "cloud-migrating",
    label: "Migrating",
    title: "Cloud migration",
    summary:
      "Shows the terminal moving delegated work from the local session to the cloud agent.",
    howItWorks: [
      "Keeps the saved session context and cloud mode visible in the terminal footer.",
      "Transitions each subagent row into the migration state.",
      "Loops as an in-progress migration step so the handoff can be reviewed clearly.",
    ],
    section: "cloud",
    startPhase: "cloudMigrating",
    endPhase: "cloudMigrating",
    loop: true,
    showPriorState: true,
  },
  {
    slug: "cloud-ready",
    label: "Cloud ready",
    title: "Cloud handoff complete",
    summary:
      "Shows the terminal after the migration has completed and the cloud agent is in a steady state.",
    howItWorks: [
      "Retains the fully built-up context from the prior local execution path.",
      "Shows the terminal in its completed cloud mode without further local changes.",
      "Holds on the final state so users can inspect the end of the handoff flow.",
    ],
    section: "cloud",
    startPhase: "pause",
    endPhase: "pause",
    loop: false,
    showPriorState: true,
  },
  {
    slug: "auth-high-fps",
    label: "Auth / centered",
    title: "Centered auth prompt",
    summary:
      "A centered authentication panel with the high-FPS ASCII cube treatment.",
    howItWorks: [
      "Uses a simplified auth shell that centers the animation and copy in the window.",
      "Keeps the cube motion active so the auth screen never feels static.",
      "Works as a startup-state variant rather than a phase in the main terminal flow.",
    ],
    section: "auth",
    type: "custom",
  },
  {
    slug: "auth",
    label: "Auth / left aligned",
    title: "Left-aligned auth prompt",
    summary:
      "A more terminal-like authentication screen with the cube and links set into a bordered panel.",
    howItWorks: [
      "Keeps the command line visible at the top of the auth layout.",
      "Frames the animated cube and documentation links inside a bordered content block.",
      "Loops the auth animation so the startup shell can be reviewed at rest.",
    ],
    section: "auth",
    type: "custom",
  },
  {
    slug: "auth-alt",
    label: "Auth / wordmark",
    title: "Wordmark auth prompt",
    summary:
      "An alternate auth surface that introduces the wordmark through a scrambled reveal before settling into a loop.",
    howItWorks: [
      "Animates the command label first, then resolves the larger lockup into place.",
      "Types the auth prompt after the lockup reveal for a more theatrical startup moment.",
      "Continues into a loop once the entrance animation finishes.",
    ],
    section: "auth",
    type: "custom",
  },
];

export function getScenarioBySlug(slug: string) {
  return SCENARIOS.find((scenario) => scenario.slug === slug);
}

export function getScenarioHref(slug: string) {
  return slug === DEFAULT_SCENARIO_SLUG ? "/scenarios" : `/scenarios/${slug}`;
}

export function getScenarioModeLabel(scenario: Scenario) {
  if (scenario.type === "custom") return "Custom panel";
  if (scenario.loop === false) return "Snapshot";
  return "Looping demo";
}

export function getScenarioPhaseLabel(scenario: Scenario) {
  if (scenario.type === "custom") {
    return "Custom terminal surface";
  }

  if (!scenario.startPhase) {
    return "Scenario";
  }

  const startLabel = PHASE_LABELS[scenario.startPhase];
  const endLabel = scenario.endPhase ? PHASE_LABELS[scenario.endPhase] : null;

  if (!endLabel || endLabel === startLabel) {
    return `Phase ${startLabel}`;
  }

  return `${startLabel} to ${endLabel}`;
}
