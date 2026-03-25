import { OrderCard } from "./order-card";

interface Order {
  orderid: string;
  userName: string;
  orderNumber: string;
  price: number;
}

interface OrderColumnProps {
  title: string;
  orders: Order[];
}

export function OrderColumn({ title, orders }: OrderColumnProps) {
  return (
    <div className="bg-background-light dark:bg-background-dark rounded-3xl border border-pink-soft/40 p-4 flex flex-col gap-3 h-[600px]">
      <h2 className="font-display text-lg text-text-main font-semibold px-1">
        {title}
      </h2>

      <div className="flex flex-col overflow-y-auto scrollbar-hide flex-1">
        {orders.map((order) => (
          <OrderCard
            key={order.orderid}
            userName={order.userName}
            orderNumber={order.orderNumber}
            price={order.price}
          />
        ))}
      </div>
    </div>
  );
}
