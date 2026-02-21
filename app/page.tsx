import DemoDesktop from "@/components/DemoDesktop";
import AnimatedAgentCLIPanel from "@/components/AnimatedAgentCLIPanel";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
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
              content: <AnimatedAgentCLIPanel loop />,
            },
          ]}
        />
      </div>
    </main>
  );
}
