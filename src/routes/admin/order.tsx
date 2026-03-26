import { createFileRoute } from "@tanstack/react-router";
import { Orders } from "@/features/orders/components/orders";

export const Route = createFileRoute("/admin/order")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Orders />;
}
