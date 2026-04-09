import { createFileRoute } from "@tanstack/react-router";
import { CustomizeProduct } from "@/features/products/components/customize-product.tsx";

export const Route = createFileRoute("/_client/customize-product")({
  component: RouteComponent,
});

function RouteComponent() {
  return <CustomizeProduct variantId="019d682a-a44b-7000-8b59-212af9e0f195" />;
}
