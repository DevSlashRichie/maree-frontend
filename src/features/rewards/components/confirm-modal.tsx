import { Button } from "@/components/button";
import { Modal } from "@/components/modal";
import type { Reward } from "../data/rewards-data";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  reward: Reward | null;
  onConfirm: () => void;
}

export function ConfirmModal({
  isOpen,
  onClose,
  reward,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmar Canje"
      description="¿Estás seguro de que deseas canjear esta recompensa?"
    >
      <div className="space-y-6">
        {reward && (
          <div className="bg-secondary/10 p-4 rounded-xl border border-accent/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-accent/20 rounded-full text-accent">
                <reward.icon className="w-5 h-5" />
              </div>
              <h4 className="font-display font-bold text-charcoal dark:text-white">
                {reward.title}
              </h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {reward.description}
            </p>
          </div>
        )}
        <div className="flex flex-col gap-3">
          <Button onClick={onConfirm} className="w-full">
            Confirmar Canje
          </Button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-charcoal transition-colors cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
}
