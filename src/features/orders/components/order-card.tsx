import { useDraggable } from "@dnd-kit/react";
import { Button } from "@/components/button";
import type { GetV1Orders200Item } from "@/lib/schemas";

interface OrderCardProps {
  order: GetV1Orders200Item;
  orderOnClickHandler: () => void;
}

export function OrderCard({ order, orderOnClickHandler }: OrderCardProps) {
  const { ref } = useDraggable({
    id: order.order.id,
  });
  return (
    <div
      ref={ref}
      className="bg-card-light rounded-2xl border border-pink-soft/40 px-5 py-6 my-3 flex flex-col gap-4"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-display text-base text-text-main font-semibold">
            {`${order.user?.firstName} ${order.user?.lastName}`}
          </p>
        </div>
        <span className="font-display text-xl text-text-main font-semibold shrink-0">
          ${(Number(order.order.total) / 100.0).toFixed(2)}
        </span>
      </div>
      <Button variant="action" onClick={orderOnClickHandler}>
        Ver detalles
      </Button>
    </div>
  );
}
