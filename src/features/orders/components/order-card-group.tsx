import { useDroppable } from "@dnd-kit/react";
import type { GetV1Orders200Item } from "@/lib/schemas";
import { OrderCard } from "./order-card";

interface OrderColumnProps {
  title: string;
  orders: GetV1Orders200Item[];
  displayId: string;
  orderOnClickHandler: (orderId: string) => void;
}

export function OrderColumn({
  title,
  orders,
  displayId,
  orderOnClickHandler,
}: OrderColumnProps) {
  const { ref } = useDroppable({
    id: displayId,
  });
  return (
    <div
      ref={ref}
      className="bg-background-light rounded-3xl border border-pink-soft/40 p-4 justify-center flex flex-col gap-3 h-[600px]"
    >
      <h2 className="font-display text-lg text-text-main font-semibold px-1">
        {title}
      </h2>

      <div className="flex flex-col overflow-y-auto scrollbar-hide flex-1">
        {orders.map((order) => (
          <OrderCard
            key={order.order.id}
            order={order}
            orderOnClickHandler={() => {
              orderOnClickHandler(order.order.id);
            }}
          />
        ))}
      </div>
    </div>
  );
}
