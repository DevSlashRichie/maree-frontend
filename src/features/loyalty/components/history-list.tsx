import { useState } from "react";
import { HISTORY_DATA } from "../data/history-data";
import { HistoryItem } from "./history-item";
import { HistoryModal } from "./history-modal";

export function HistoryList() {
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  return (
    <section>
      <h3 className="font-display text-2xl text-charcoal dark:text-white mb-6">
        Historial de Canjes
      </h3>
      <div className="bg-card-light dark:bg-card-dark rounded-xl border border-accent/20 dark:border-charcoal overflow-hidden">
        <ul className="divide-y divide-accent/20 dark:divide-charcoal">
          {HISTORY_DATA.slice(0, 3).map((item) => (
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
            onClick={() => setIsHistoryModalOpen(true)}
            className="text-xs text-gray-500 hover:text-charcoal dark:text-gray-400 dark:hover:text-white font-bold uppercase tracking-widest transition-colors cursor-pointer"
          >
            Ver historial completo
          </button>
        </div>
      </div>

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />
    </section>
  );
}
