import { OrderCard } from "./order-card";

interface Order {
  orderId: string;
  userName: string;
  orderNumber: number;
  price: number;
}

interface OrderColumnProps {
  title: string;
  orders: Order[];
  orderOnClickHandler: (orderId: string) => void;
}

export function OrderColumn({
  title,
  orders,
  orderOnClickHandler,
}: OrderColumnProps) {
  return (
    <div className="bg-background-light dark:bg-background-dark rounded-3xl border border-pink-soft/40 p-4 flex flex-col gap-3 h-[600px]">
      <h2 className="font-display text-lg text-text-main font-semibold px-1">
        {title}
      </h2>

      <div className="flex flex-col overflow-y-auto scrollbar-hide flex-1">
        {orders.map((order) => (
          <OrderCard
            key={order.orderId}
            orderId={order.orderId}
            userName={order.userName}
            orderNumber={order.orderNumber}
            price={order.price}
            orderOnClickHandler={() => {
              orderOnClickHandler(order.orderId);
            }}
          />
        ))}
      </div>
    </div>
  );
}
