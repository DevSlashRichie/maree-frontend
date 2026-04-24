import { createFileRoute } from "@tanstack/react-router";
import { CreateProduct } from "@/features/products/components/create-product";

export const Route = createFileRoute("/admin/create-product")({
  component: RouteComponent,
});

function RouteComponent() {
  return <CreateProduct />;
}
