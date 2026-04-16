import { createFileRoute } from "@tanstack/react-router";
import OrderTypeSelector from "@/features/orders/components/order-type-selector";

export const Route = createFileRoute("/_client/order-setup")({
  component: OrderSetupPage,
});

function OrderSetupPage() {
  return (
    <div >
      <OrderTypeSelector />
    </div>
  );
}