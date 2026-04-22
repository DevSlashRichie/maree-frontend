import { createFileRoute } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { ChevronLeft, ChevronRight, Gift, Search } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/button";
import { HistoryItem } from "@/components/ui/history-item";
import { Modal } from "@/components/ui/modal";
import { LoyaltyCard } from "@/features/loyalty/components/loyalty-card";
import { RewardCard } from "@/features/loyalty/components/reward-card";
import { requireAuth } from "@/hooks/with-auth";
import { useGetV1Branches, useGetV1Loyalty, useGetV1Rewards, useGetV1RewardsHistory } from "@/lib/api";

export const Route = createFileRoute("/_client/loyalty")({
  beforeLoad: async ({ location }) => {
    await requireAuth({ location, navigateTo: "/login" });
  },
  pendingComponent: () => (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg text-muted-foreground">Loading...</p>
    </div>
  ),
  component: RouteComponent,
});

type RewardItem = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  isAvailable: boolean;
  points: number;
};

function RouteComponent() {
  const { data, isLoading } = useGetV1Loyalty();
  const { data: rewardsData, isLoading: rewardsLoading } = useGetV1Rewards();

  const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { data: fullHistoryData } = useGetV1RewardsHistory({
    swr: { enabled: isHistoryModalOpen },
  });

  const { data: branchesData } = useGetV1Branches({
    swr: { enabled: isHistoryModalOpen },
  });

  const apiHistory = useMemo(() => {
    if (data?.status !== 200) return [];
    return data.data.lastRedemptions || [];
  }, [data]);

  const rewards = useMemo<RewardItem[]>(() => {
    const balance = data?.status === 200 ? Number(data.data.currentBalance) : 0;
    return (rewardsData?.data ?? []).map((r) => ({
      id: r.id,
      title: r.name,
      description: r.description,
      icon: Gift,
      isAvailable: balance >= Number(r.cost),
      points: Number(r.cost),
    }));
  }, [rewardsData, data]);

  const fullHistory = useMemo(() => {
    if (fullHistoryData?.status !== 200) return [];
    return (fullHistoryData.data ?? []).map((item) => ({
      ...item,
      rewardName: rewardsData?.data?.find((r) => r.id === item.rewardId)?.name ?? item.rewardId,
      branchName: branchesData?.status === 200
        ? (branchesData.data.find((b) => b.id === item.branchId)?.name ?? item.branchId)
        : item.branchId,
    }));
  }, [fullHistoryData, rewardsData, branchesData]);

  const filteredFullHistory = useMemo(() => {
    return fullHistory.filter((item) =>
      item.rewardName.toLowerCase().includes(historySearch.toLowerCase()) ||
      item.branchName.toLowerCase().includes(historySearch.toLowerCase())
    );
  }, [fullHistory, historySearch]);

  const groupedHistory = useMemo(() => {
    const groups: Record<string, typeof fullHistory> = {};
    for (const item of filteredFullHistory) {
      const dateObj = new Date(item.createdAt);
      const monthLabel = dateObj.toLocaleString("es-MX", {
        month: "long",
        year: "numeric",
      });
      if (!groups[monthLabel]) groups[monthLabel] = [];
      groups[monthLabel].push(item);
    }
    return groups;
  }, [filteredFullHistory]);

  const handleRedeemClick = (reward: RewardItem) => {
    setSelectedReward(reward);
    setIsConfirmModalOpen(true);
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const confirmRedemption = () => {
    if (selectedReward) {
      console.log(`Confirmado: Canjeando ${selectedReward.title}`);
      setIsConfirmModalOpen(false);
    }
  };

  if (isLoading || rewardsLoading) {
    return (
      <div className="h-screen flex items-center justify-center font-display text-accent">
        Cargando...
      </div>
    );
  }

  if (!data || data.status !== 200) {
    return (
      <div className="p-10 text-center text-charcoal">
        {data?.data?.message || "Error al cargar"}
      </div>
    );
  }

  return (
    <div className="mt-5">
      <div className="texture-bg min-h-screen pb-20">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5 space-y-6">
              <LoyaltyCard />
            </div>

            <div className="md:col-span-7 space-y-2 overflow-x-auto">
              <section>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-display text-2xl text-charcoal dark:text-white">
                    Recompensas
                  </h3>
                  <div className="hidden md:flex gap-2">
                    <button
                      type="button"
                      onClick={() => scroll("left")}
                      className="p-1 rounded-full border border-accent/20 text-accent cursor-pointer"
                    >
                      <ChevronLeft />
                    </button>
                    <button
                      type="button"
                      onClick={() => scroll("right")}
                      className="p-1 rounded-full border border-accent/20 text-accent cursor-pointer"
                    >
                      <ChevronRight />
                    </button>
                  </div>
                </div>
                <div
                  ref={scrollContainerRef}
                  className="flex overflow-x-auto gap-4 pb-6 snap-x scrollbar-hide"
                >
                  {rewards.map((reward) => (
                    <div key={reward.id} className="min-w-[280px] snap-start">
                      <RewardCard
                        {...reward}
                        onRedeem={() => handleRedeemClick(reward)}
                      />
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="font-display text-2xl text-charcoal dark:text-white mb-6">
                  Historial
                </h3>
                <div className="bg-card-light dark:bg-card-dark rounded-xl border border-accent/20 overflow-hidden">
                  {!apiHistory.length ? (
                    <div className="text-center p-3 text-gray-400 italic">
                      No hay nada en el historial
                    </div>
                  ) : null}
                  <ul className="divide-y divide-accent/20">
                    {apiHistory.slice(0, 3).map((item) => (
                      <HistoryItem
                        key={`${item.name}-${item.branch}-${item.date}`}
                        title={item.name}
                        location={item.branch}
                        date={item.date}
                        status="Completado"
                      />
                    ))}
                  </ul>
                  <div className="p-3 bg-gray-50 dark:bg-charcoal/30 text-center border-t border-accent/20">
                    <button
                      type="button"
                      onClick={() => setIsHistoryModalOpen(true)}
                      className="text-xs font-bold uppercase text-gray-500 cursor-pointer"
                    >
                      Ver historial completo
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title="Historial Completo"
      >
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-charcoal/50 border rounded-lg text-sm"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
            />
          </div>

          <div className="h-[400px] overflow-y-auto space-y-6 pr-2">
            {Object.entries(groupedHistory).map(([month, items]) => (
              <div key={month}>
                <h4 className="text-[10px] uppercase font-bold text-gray-400 mb-3">
                  {month}
                </h4>
                <div className="bg-white dark:bg-charcoal/30 rounded-xl border divide-y">
                  {items.map((item) => (
                    <HistoryItem
                      key={item.id}
                      title={item.rewardName}
                      location={item.branchName}
                      date={item.createdAt}
                      status="Completado"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirmar Canje"
      >
        <div className="space-y-6">
          {selectedReward && (
            <div className="bg-secondary/10 p-4 rounded-xl border border-accent/20 flex items-center gap-3">
              <selectedReward.icon className="text-accent" />
              <h4 className="font-bold">{selectedReward.title}</h4>
            </div>
          )}
          <Button onClick={confirmRedemption} className="w-full">
            Confirmar
          </Button>
        </div>
      </Modal>
    </div>
  );
}