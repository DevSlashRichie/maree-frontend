import { Button } from "@/components/button";
import { formatCentsToDisplay } from "@/lib/money";

interface OrderCardReadyProps {
  userName: string;
  orderNumber: string;
  price: number;
}

export function OrderCardReady({
  userName,
  orderNumber,
  price,
}: OrderCardReadyProps) {
  return (
    <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-pink-soft/40 px-5 py-6 my-3 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-display text-base text-text-main font-semibold">
            {userName}
          </p>
          <p className="font-body text-xs text-text-main/50 tracking-wide uppercase">
            Orden #{orderNumber}
          </p>
        </div>
        <span className="font-display text-xl text-text-main font-semibold shrink-0">
          ${formatCentsToDisplay(price)}
        </span>
      </div>
      <div className="flex gap-3">
        <Button
          variant="action"
          className="w-full py-2 bg-accent/20 dark:bg-charcoal text-charcoal dark:text-accent rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-accent hover:text-white dark:hover:bg-accent dark:hover:text-charcoal transition-all"
        >
          Ver detalles
        </Button>
        <Button
          variant="action"
          className="w-full py-2 bg-accent/20 dark:bg-charcoal text-charcoal dark:text-accent rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-accent hover:text-white dark:hover:bg-accent dark:hover:text-charcoal transition-all"
        >
          Marcar Listo
        </Button>
      </div>
    </div>
  );
}
