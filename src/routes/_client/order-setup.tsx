import { createFileRoute } from "@tanstack/react-router";
import OrderTypeSelector from "@/features/orders/components/order-type-selector";

export const Route = createFileRoute("/_client/order-setup")({
  component: OrderSetupPage,
});

function OrderSetupPage() {
  return (
    <div className="min-h-screen flex flex-col p-6">
      <div className="flex-1 flex items-center justify-center">
        <OrderTypeSelector />
      </div>
    </div>
  );
}
