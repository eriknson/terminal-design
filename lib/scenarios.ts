import type { CLIDemoPhase } from "@/components/AnimatedAgentCLIPanel";

export type Scenario = {
  slug: string;
  label: string;
  /** When "custom", the ScenarioPage renders customContent instead of AnimatedAgentCLIPanel */
  type?: "phase" | "custom";
  startPhase?: CLIDemoPhase;
  endPhase?: CLIDemoPhase;
  loop?: boolean;
  showPriorState?: boolean;
};

export const SCENARIOS: Scenario[] = [
  { slug: "full-loop", label: "Full Loop", startPhase: "idle", loop: true, showPriorState: false },
  { slug: "auth", label: "Auth", type: "custom" },
  { slug: "auth-alt", label: "Auth Alt", type: "custom" },
  { slug: "idle", label: "Idle", startPhase: "idle", endPhase: "idle", loop: false, showPriorState: false },
  { slug: "typing", label: "Typing", startPhase: "typing", endPhase: "typing", loop: true, showPriorState: false },
  { slug: "questions", label: "Questions", startPhase: "questions", endPhase: "selection", loop: true, showPriorState: true },
  { slug: "multi-agent", label: "Multi-Agent", startPhase: "initializing", endPhase: "subagents", loop: true, showPriorState: true },
];
