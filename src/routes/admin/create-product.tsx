import { createFileRoute } from "@tanstack/react-router";
import { CreateProduct } from "@/features/products/components/create-product";
import { requirePolicy } from "@/hooks/with-auth";

export const Route = createFileRoute("/admin/create-product")({
  beforeLoad: () => requirePolicy("write:products"),
  component: RouteComponent,
});

function RouteComponent() {
  return <CreateProduct />;
}
