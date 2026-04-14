import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import { CustomizeProduct } from "@/features/products/components/customize-product.tsx";
import { useCartStore } from "@/hooks/use-cart-store";

const DEFAULT_VARIANT_ID = "019d8960-28bf-7000-a97d-5eb41f61edf2";

export const Route = createFileRoute("/_client/customize-product")({
  validateSearch: z.object({
    variantId: z.string().optional(),
    itemId: z.string().optional(),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { variantId, itemId } = Route.useSearch();
  const editingItem = useCartStore((state) =>
    itemId ? state.items.find((item) => item.itemId === itemId) : undefined,
  );

  const resolvedVariantId =
    editingItem?.variantId ?? variantId ?? DEFAULT_VARIANT_ID;

  return <CustomizeProduct variantId={resolvedVariantId} itemId={itemId} />;
}
