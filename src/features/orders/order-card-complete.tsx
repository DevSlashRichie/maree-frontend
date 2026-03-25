import { Button } from "@/components/button";
import { Input } from "@/components/input";

interface OrderCardProps {
  userName: string;
  orderNumber: string;
  price: number;
}

export function OrderCard({ userName, orderNumber, price }: OrderCardProps) {
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
          ${price.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
        </span>
      </div>

      <Input
        label="Código de verificación"
        placeholder="Ingresa el código"
        name="verificationCode"
        className="bg-background-light text-center border-primary/25 focus:border-primary/50 placeholder:text-center"
      />

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
          Verificar código
        </Button>
      </div>
    </div>
  );
}