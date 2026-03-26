import { createFileRoute } from "@tanstack/react-router";
import { ProgressBar } from "@/components/progress-bar";
import { HistoryList, LoyaltyCard } from "@/features/loyalty";
import { RewardsCarousel } from "@/features/rewards";

export const Route = createFileRoute("/_client/loyalty")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="mt-5">
      <div className="texture-bg min-h-screen pb-20">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5 space-y-6">
              <LoyaltyCard memberName="Ana López" memberId="4427536211" />
              <ProgressBar
                current={8}
                total={10}
                label="¡Solo 2 visitas más para tu recompensa!"
              />
            </div>
            <div className="md:col-span-7 space-y-2 overflow-x-auto">
              <RewardsCarousel />
              <HistoryList />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
