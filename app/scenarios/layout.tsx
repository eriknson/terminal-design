import ScenarioSidebar from "@/components/ScenarioSidebar";

export default function ScenariosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto grid max-w-[1500px] gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start">
          <ScenarioSidebar />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}
