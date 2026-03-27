import { createFileRoute } from "@tanstack/react-router";
import {
  Cake,
  ChevronLeft,
  ChevronRight,
  Coffee,
  IceCream,
  Search,
  Utensils,
  UtensilsCrossed,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/button";
import { HistoryItem } from "@/components/ui/history-item";
import { LoyaltyCard } from "@/components/ui/loyalty-card";
import { Modal } from "@/components/ui/modal";
import { RewardCard } from "@/components/ui/reward-card";
import { useGetV1Loyalty } from "@/lib/api";

export const Route = createFileRoute("/_client/loyalty")({
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

function RouteComponent() {
  // 1. Hooks de API y Estado siempre al principio
  const { data, isLoading } = useGetV1Loyalty();

  const [selectedReward, setSelectedReward] = useState<
    (typeof REWARDS_DATA)[0] | null
  >(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const [historyFilter, setHistoryFilter] = useState<
    "all" | "redeemed" | "gift"
  >("all");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 2. Extraer y filtrar la data de la API
  const apiHistory = useMemo(() => data?.data?.lastRedemptions || [], [data]);

  const filteredHistory = useMemo(() => {
    return apiHistory.filter((item: any) => {
      const matchesSearch =
        item.name.toLowerCase().includes(historySearch.toLowerCase()) ||
        item.branch.toLowerCase().includes(historySearch.toLowerCase());

      // Si no hay status en la API para filtrar, solo usamos la búsqueda
      return matchesSearch;
    });
  }, [apiHistory, historySearch]);

  const groupedHistory = useMemo(() => {
    const groups: Record<string, any[]> = {};
    for (const item of filteredHistory) {
      const dateObj = new Date(item.date);
      const monthLabel = dateObj.toLocaleString("es-MX", {
        month: "long",
        year: "numeric",
      });
      if (!groups[monthLabel]) groups[monthLabel] = [];
      groups[monthLabel].push(item);
    }
    return groups;
  }, [filteredHistory]);

  // 3. Manejadores de eventos
  const handleRedeemClick = (reward: (typeof REWARDS_DATA)[0]) => {
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

  // 4. Retornos de estado (después de definir todos los hooks)
  if (isLoading) {
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
                      onClick={() => scroll("left")}
                      className="p-1 rounded-full border border-accent/20 text-accent cursor-pointer"
                    >
                      <ChevronLeft />
                    </button>
                    <button
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
                  {REWARDS_DATA.map((reward) => (
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
                  <ul className="divide-y divide-accent/20">
                    {apiHistory.slice(0, 3).map((item: any, idx: number) => (
                      <HistoryItem
                        key={item.id || idx}
                        title={item.name}
                        location={item.branch}
                        date={item.date}
                        status="Completado"
                      />
                    ))}
                  </ul>
                  <div className="p-3 bg-gray-50 dark:bg-charcoal/30 text-center border-t border-accent/20">
                    <button
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

      {/* Modal Historial */}
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
                  {items.map((item: any, idx: number) => (
                    <HistoryItem
                      key={item.id || idx}
                      title={item.name}
                      location={item.branch}
                      date={item.date}
                      status="Completado"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Modal Confirmación */}
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
