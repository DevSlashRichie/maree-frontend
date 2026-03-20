import { Search } from "lucide-react";
import { Modal } from "@/components/modal";
import { useHistoryFilter } from "../hooks/use-history-filter";
import { HistoryItem } from "./history-item";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
  const {
    historySearch,
    setHistorySearch,
    historyFilter,
    setHistoryFilter,
    filteredHistory,
    groupedHistory,
  } = useHistoryFilter();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Historial de Actividad"
      description="Revisa tus canjes y recompensas obtenidas"
      maxWidth="xl"
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por recompensa o sucursal..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-charcoal/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {(["all", "redeemed", "gift"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setHistoryFilter(filter)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                  historyFilter === filter
                    ? "bg-accent text-white border-accent"
                    : "bg-white dark:bg-charcoal text-gray-500 border-gray-200 dark:border-gray-700 hover:border-accent/50"
                }`}
              >
                {filter === "all"
                  ? "Todos"
                  : filter === "redeemed"
                    ? "Canjes"
                    : "Regalos"}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[500px] overflow-y-auto pr-2 scrollbar-thin space-y-6">
          {Object.keys(groupedHistory).length > 0 ? (
            Object.entries(groupedHistory).map(([month, items]) => (
              <div key={month}>
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-3 ml-1">
                  {month}
                </h4>
                <div className="bg-white dark:bg-charcoal/30 rounded-xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
                  {items.map((item) => (
                    <HistoryItem
                      key={item.id}
                      title={item.title}
                      location={item.location}
                      date={item.date}
                      status={item.status}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-gray-50 dark:bg-charcoal/50 rounded-full mb-4">
                <Search className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 text-sm">
                No se encontraron resultados para tu búsqueda.
              </p>
              <button
                type="button"
                onClick={() => {
                  setHistorySearch("");
                  setHistoryFilter("all");
                }}
                className="mt-4 text-accent text-xs font-bold uppercase tracking-widest hover:underline"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs">
          <span className="text-gray-400">
            Total de actividades: {filteredHistory.length}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-accent font-bold uppercase tracking-widest hover:underline"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
