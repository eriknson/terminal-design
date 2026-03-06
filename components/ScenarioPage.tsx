import DemoDesktop from "@/components/DemoDesktop";
import AnimatedAgentCLIPanel from "@/components/AnimatedAgentCLIPanel";
import AuthPanel from "@/components/AuthPanel";
import AuthPanelHighFps from "@/components/AuthPanelHighFps";
import AuthAltPanel from "@/components/AuthAltPanel";
import {
  DEFAULT_SCENARIO_SLUG,
  SCENARIO_SECTIONS,
  type Scenario,
  getScenarioBySlug,
  getScenarioModeLabel,
  getScenarioPhaseLabel,
} from "@/lib/scenarios";

function getWindowContent(scenario: Scenario) {
  if (scenario.type === "custom" && scenario.slug === "auth") {
    return <AuthPanel key={scenario.slug} />;
  }
  if (scenario.type === "custom" && scenario.slug === "auth-high-fps") {
    return <AuthPanelHighFps key={scenario.slug} />;
  }
  if (scenario.type === "custom" && scenario.slug === "auth-alt") {
    return <AuthAltPanel key={scenario.slug} />;
  }
  return (
    <AnimatedAgentCLIPanel
      key={scenario.slug}
      loop={scenario.loop ?? true}
      startPhase={scenario.startPhase ?? "idle"}
      endPhase={scenario.endPhase}
      showPriorState={scenario.showPriorState ?? false}
    />
  );
}

export default function ScenarioPage({ slug }: { slug: string }) {
  const scenario =
    getScenarioBySlug(slug) ?? getScenarioBySlug(DEFAULT_SCENARIO_SLUG)!;
  const section =
    SCENARIO_SECTIONS.find((item) => item.id === scenario.section) ??
    SCENARIO_SECTIONS[0];

  return (
    <div className="space-y-6">
      <section className="theme-panel px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <div className="theme-kicker">{section.label}</div>
            <h1 className="mt-2 text-[clamp(1.9rem,2.8vw,2.8rem)] font-semibold tracking-tight text-[var(--color-theme-text)]">
              {scenario.title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-[var(--color-theme-text-sec)]">
              {scenario.summary}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="theme-pill">{getScenarioModeLabel(scenario)}</span>
            <span className="theme-pill">{getScenarioPhaseLabel(scenario)}</span>
            <span className="theme-pill">
              {scenario.showPriorState ? "Seeds prior context" : "Starts clean"}
            </span>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {scenario.howItWorks.map((item, index) => (
            <div
              key={`${scenario.slug}-${index}`}
              className="theme-subtle-card px-4 py-3"
            >
              <div className="theme-kicker">How it works {index + 1}</div>
              <p className="mt-2 text-sm leading-6 text-[var(--color-theme-text-sec)]">
                {item}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="theme-panel px-4 py-4 sm:px-6 sm:py-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="theme-kicker">Mock terminal</div>
            <p className="mt-1 text-sm leading-6 text-[var(--color-theme-text-sec)]">
              Simulates the selected Cursor Agent terminal state inside the
              draggable desktop window.
            </p>
          </div>

          <div className="theme-subtle-card px-3 py-2 text-xs leading-5 text-[var(--color-theme-text-sec)]">
            Drag or resize the terminal window to inspect the composition.
          </div>
        </div>

        <DemoDesktop
          backgroundImage={{
            src: "https://ptht05hbb1ssoooe.public.blob.vercel-storage.com/assets/misc/asset-0ec1f3ba625f482c9dc3.jpg",
            alt: "Sunlit woodland background",
          }}
          innerPaddingPx={32}
          disableResizing={false}
          minHeight={650}
          animateEntrance
          windows={[
            {
              id: "cursor-agent-cli",
              title: "agent",
              widthPx: 580,
              heightPx: 420,
              x: 50,
              scale: 1,
              zIndex: 20,
              content: getWindowContent(scenario),
            },
          ]}
        />
      </section>
    </div>
  );
}
