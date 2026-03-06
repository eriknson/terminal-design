import ScenarioPage from "@/components/ScenarioPage";
import { DEFAULT_SCENARIO_SLUG } from "@/lib/scenarios";

export default function Page() {
  return <ScenarioPage slug={DEFAULT_SCENARIO_SLUG} />;
}
