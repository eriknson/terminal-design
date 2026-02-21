import { notFound } from "next/navigation";
import { SCENARIOS } from "@/lib/scenarios";
import ScenarioPage from "@/components/ScenarioPage";

export function generateStaticParams() {
  return SCENARIOS.map((s) => ({ slug: s.slug }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!SCENARIOS.find((s) => s.slug === slug)) {
    notFound();
  }

  return <ScenarioPage slug={slug} />;
}
