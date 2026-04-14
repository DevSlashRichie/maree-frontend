import { createFileRoute } from "@tanstack/react-router";
import { Cart } from "@/features/cart/components/cart.tsx";

export const Route = createFileRoute("/_client/cart")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Cart />;
}
