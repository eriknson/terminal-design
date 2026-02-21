"use client";

import Link from "next/link";
import DemoDesktop from "@/components/DemoDesktop";
import AnimatedAgentCLIPanel from "@/components/AnimatedAgentCLIPanel";
import AuthPanel from "@/components/AuthPanel";
import AuthAltPanel from "@/components/AuthAltPanel";
import { SCENARIOS } from "@/lib/scenarios";

function getWindowContent(scenario: (typeof SCENARIOS)[number]) {
  if (scenario.type === "custom" && scenario.slug === "auth") {
    return <AuthPanel key={scenario.slug} />;
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
  const scenario = SCENARIOS.find((s) => s.slug === slug) ?? SCENARIOS[0];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-5xl">
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

        {/* Tab bar */}
        <div
          className="mt-4 flex gap-1 rounded-[6px] p-1"
          style={{ backgroundColor: "var(--color-theme-card-hex)" }}
        >
          {SCENARIOS.map((s) => (
            <Link
              key={s.slug}
              href={`/scenarios/${s.slug}`}
              className="rounded-[4px] px-3 py-1.5 font-mono text-xs transition-colors"
              style={{
                backgroundColor:
                  s.slug === slug
                    ? "var(--color-theme-bg)"
                    : "transparent",
                color:
                  s.slug === slug
                    ? "var(--color-theme-text)"
                    : "var(--color-theme-text-sec)",
                boxShadow:
                  s.slug === slug
                    ? "0 1px 2px rgba(0,0,0,0.06), 0 0 0 1px var(--color-theme-border-02)"
                    : "none",
              }}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
