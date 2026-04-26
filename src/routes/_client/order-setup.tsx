import { createFileRoute } from "@tanstack/react-router";
import OrderTypeSelector from "@/features/orders/components/order-type-selector";
import { requireAuth } from "@/hooks/with-auth";

export const Route = createFileRoute("/_client/order-setup")({
  beforeLoad: async ({ location }) => {
    await requireAuth({ location, navigateTo: "/login" });
  },
  pendingComponent: () => (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg text-muted-foreground">Loading...</p>
    </div>
  ),
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
