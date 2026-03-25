import { Button } from "@/components/button";

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
      <Button variant="action">Ver detalles</Button>
    </div>
  );
}