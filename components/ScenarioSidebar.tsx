"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DEFAULT_SCENARIO_SLUG,
  SCENARIOS,
  SCENARIO_SECTIONS,
  getScenarioHref,
  getScenarioModeLabel,
} from "@/lib/scenarios";

function getActiveScenarioSlug(pathname: string | null) {
  if (!pathname || pathname === "/" || pathname === "/scenarios") {
    return DEFAULT_SCENARIO_SLUG;
  }

  const match = pathname.match(/^\/scenarios\/([^/]+)/);
  return match?.[1] ?? DEFAULT_SCENARIO_SLUG;
}

export default function ScenarioSidebar() {
  const pathname = usePathname();
  const activeSlug = getActiveScenarioSlug(pathname);

  return (
    <div className="theme-panel theme-panel-muted flex max-h-[calc(100vh-3rem)] flex-col overflow-hidden">
      <div className="border-b border-[var(--color-theme-border-02)] px-5 py-5">
        <div className="theme-kicker">Terminal explorer</div>
        <div className="mt-2 text-lg font-semibold text-[var(--color-theme-text)]">
          Cursor Agent scenarios
        </div>
        <p className="mt-2 text-sm leading-6 text-[var(--color-theme-text-sec)]">
          Browse every supported mock terminal state, compare the behavior, and
          jump straight into the scenario you want to simulate.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="theme-pill">{SCENARIOS.length} scenarios</span>
          <span className="theme-pill">{SCENARIO_SECTIONS.length} groups</span>
        </div>
      </div>

      <div className="thin-scrollbar flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {SCENARIO_SECTIONS.map((section) => {
          const sectionScenarios = SCENARIOS.filter(
            (scenario) => scenario.section === section.id
          );

          return (
            <section key={section.id} className="space-y-2">
              <div className="px-2">
                <div className="theme-kicker">{section.label}</div>
                <p className="mt-1 text-xs leading-5 text-[var(--color-theme-text-ter)]">
                  {section.description}
                </p>
              </div>

              <div className="space-y-1.5">
                {sectionScenarios.map((scenario) => {
                  const isActive = activeSlug === scenario.slug;

                  return (
                    <Link
                      key={scenario.slug}
                      href={getScenarioHref(scenario.slug)}
                      aria-current={isActive ? "page" : undefined}
                      className="theme-sidebar-item block rounded-[14px] border px-3 py-3 transition-colors"
                      data-active={isActive}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-[var(--color-theme-text)]">
                            {scenario.label}
                          </div>
                          <p className="mt-1 text-xs leading-5 text-[var(--color-theme-text-sec)]">
                            {scenario.summary}
                          </p>
                        </div>
                        <span className="theme-pill shrink-0">
                          {getScenarioModeLabel(scenario)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <div className="border-t border-[var(--color-theme-border-02)] px-5 py-4 text-xs leading-5 text-[var(--color-theme-text-ter)]">
        Pick a scenario to swap the mock terminal and inspect the expected
        behavior before interacting with the window.
      </div>
    </div>
  );
}
