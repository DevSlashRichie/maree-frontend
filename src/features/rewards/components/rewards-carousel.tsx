import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import { REWARDS_DATA, type Reward } from "../data/rewards-data.ts";
import { ConfirmModal } from "./confirm-modal";
import { RewardCard } from "./reward-card";

export function RewardsCarousel() {
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleRedeemClick = (reward: Reward) => {
    setSelectedReward(reward);
    setIsConfirmModalOpen(true);
  };

  const confirmRedemption = () => {
    if (selectedReward) {
      console.log(`Confirmado: Canjeando ${selectedReward.title}`);
      setIsConfirmModalOpen(false);
    }
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-display text-2xl text-charcoal dark:text-white">
          Recompensas Disponibles
        </h3>
        <div className="hidden md:flex gap-2">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="p-1 rounded-full border border-accent/20 hover:bg-accent/10 text-accent transition-colors cursor-pointer"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="p-1 rounded-full border border-accent/20 hover:bg-accent/10 text-accent transition-colors cursor-pointer"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory scrollbar-hide px-4 sm:mx-0 sm:px-0"
      >
        {REWARDS_DATA.map((reward) => (
          <div
            key={reward.id}
            className="min-w-[280px] sm:min-w-[320px] snap-start"
          >
            <RewardCard
              title={reward.title}
              description={reward.description}
              icon={reward.icon}
              isAvailable={reward.isAvailable}
              points={reward.points}
              onRedeem={() => handleRedeemClick(reward)}
            />
          </div>
        ))}
      </div>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        reward={selectedReward}
        onConfirm={confirmRedemption}
      />
    </section>
  );
}
