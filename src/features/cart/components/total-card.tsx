import { ArrowRight } from "lucide-react";
import { formatCentsToDisplay } from "@/lib/money";

interface TotalCardProps {
  totalCents: number;
  onConfirm?: () => void;
  isSubmitting?: boolean;
  isDisabled?: boolean;
}

export function TotalCard({
  totalCents,
  onConfirm,
  isSubmitting = false,
  isDisabled = false,
}: TotalCardProps) {
  return (
    <div className="bg-card-light rounded-2xl border border-pink-soft/40 px-4 sm:px-5 py-4 sm:py-5 flex flex-col gap-4">
      <h2 className="font-display text-xl font-normal text-text-main m-0">
        Resumen de Pago
      </h2>
      <hr className="border-pink-soft/20 m-0" />
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-main/60 m-0">Total</p>
        <p className="font-display text-xl text-text-main m-0">
          ${formatCentsToDisplay(totalCents)}
        </p>
      </div>
      <button
        type="button"
        onClick={onConfirm}
        disabled={isDisabled || isSubmitting}
        className="w-full bg-charcoal text-white rounded-xl py-3.5 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest hover:bg-charcoal/90 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-charcoal disabled:active:scale-100"
      >
        {isSubmitting ? "Enviando pedido..." : "Confirmar Pedido"}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
