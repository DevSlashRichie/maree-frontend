import { createFileRoute } from "@tanstack/react-router";
import {
  Cake,
  ChevronLeft,
  ChevronRight,
  Coffee,
  IceCream,
  Utensils,
  UtensilsCrossed,
} from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { HistoryItem } from "@/components/ui/history-item";
import { LoyaltyCard } from "@/components/ui/loyalty-card";
import { Modal } from "@/components/ui/modal";
import { ProgressBar } from "@/components/ui/progress-bar";
import { RewardCard } from "@/components/ui/reward-card";

export const Route = createFileRoute("/loyalty")({
  component: RouteComponent,
});

const REWARDS_DATA = [
  {
    id: 1,
    title: "Crepa Dulce Gratis",
    description:
      "Elige cualquier crepa dulce de nuestro menú clásico para celebrar.",
    icon: UtensilsCrossed,
    isAvailable: true,
  },
  {
    id: 2,
    title: "Café de Especialidad",
    description: "Un café latte o cappuccino mediano preparado por baristas.",
    icon: Coffee,
    isAvailable: false,
    points: 50,
  },
  {
    id: 3,
    title: "Bebida de Temporada",
    description: "Prueba nuestra bebida especial del mes totalmente gratis.",
    icon: IceCream,
    isAvailable: true,
  },
  {
    id: 4,
    title: "Postre Especial",
    description: "Un postre artesanal hecho en casa para endulzar tu día.",
    icon: Cake,
    isAvailable: false,
    points: 75,
  },
  {
    id: 5,
    title: "Combo Pareja",
    description: "Descuento especial en nuestro combo para dos personas.",
    icon: Utensils,
    isAvailable: false,
    points: 150,
  },
];

const HISTORY_DATA = [
  {
    id: 1,
    title: "Crepa Salada - La Marée",
    location: "Sucursal Polanco",
    date: "15 OCT 2023",
    status: "redeemed" as const,
  },
  {
    id: 2,
    title: "Bebida Refrescante",
    location: "Sucursal Roma Norte",
    date: "02 SEP 2023",
    status: "redeemed" as const,
  },
  {
    id: 3,
    title: "Regalo de Cumpleaños",
    location: "App Móvil",
    date: "20 AGO 2023",
    status: "gift" as const,
  },
];

function RouteComponent() {
  const [selectedReward, setSelectedReward] = useState<
    (typeof REWARDS_DATA)[0] | null
  >(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleRedeemClick = (reward: (typeof REWARDS_DATA)[0]) => {
    setSelectedReward(reward);
    setIsConfirmModalOpen(true);
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340; // Card width + gap
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
              </section>

              <section>
                <h3 className="font-display text-2xl text-charcoal dark:text-white mb-6">
                  Historial de Canjes
                </h3>
                <div className="bg-card-light dark:bg-card-dark rounded-xl border border-accent/20 dark:border-charcoal overflow-hidden">
                  <ul className="divide-y divide-accent/20 dark:divide-charcoal">
                    {HISTORY_DATA.map((item) => (
                      <HistoryItem
                        key={item.id}
                        title={item.title}
                        location={item.location}
                        date={item.date}
                        status={item.status}
                      />
                    ))}
                  </ul>
                  <div className="p-3 bg-gray-50 dark:bg-charcoal/30 text-center border-t border-accent/20 dark:border-charcoal">
                    <button
                      type="button"
                      className="text-xs text-gray-500 hover:text-charcoal dark:text-gray-400 dark:hover:text-white font-bold uppercase tracking-widest transition-colors cursor-pointer"
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

      {/* Modal de Confirmación */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirmar Canje"
        description="¿Estás seguro de que deseas canjear esta recompensa?"
      >
        <div className="space-y-6">
          {selectedReward && (
            <div className="bg-secondary/10 p-4 rounded-xl border border-accent/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-accent/20 rounded-full text-accent">
                  <selectedReward.icon className="w-5 h-5" />
                </div>
                <h4 className="font-display font-bold text-charcoal dark:text-white">
                  {selectedReward.title}
                </h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {selectedReward.description}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button onClick={confirmRedemption} className="w-full">
              Confirmar Canje
            </Button>
            <button
              type="button"
              onClick={() => setIsConfirmModalOpen(false)}
              className="w-full py-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-charcoal transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
