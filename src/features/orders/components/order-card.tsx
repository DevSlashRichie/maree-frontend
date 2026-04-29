import { Button } from "@/components/button";
import { formatPrice } from "@/lib/money";
import type { GetV1Orders200Item } from "@/lib/schemas";

interface OrderCardProps {
  order: GetV1Orders200Item;
  orderOnClickHandler: () => void;
}

export function OrderCard({ order, orderOnClickHandler }: OrderCardProps) {
  return (
    <div className="bg-card-light rounded-2xl border border-pink-soft/40 px-5 py-6 my-3 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-display text-base text-text-main font-semibold">
            {`${order.user?.firstName} ${order.user?.lastName}`}
          </p>
          <p className="font-body text-xs text-text-main/50 tracking-wide uppercase">
            Orden #{order.order.orderNumber}
          </p>
        </div>
        <span className="font-display text-xl text-text-main font-semibold shrink-0">
          {formatPrice(order.order.total)}
        </span>
      </div>
      <Button variant="action" onClick={orderOnClickHandler}>
        Ver detalles
      </Button>
    </div>
  );
}
