import { createFileRoute, Outlet } from "@tanstack/react-router";
import { getV1ProductsVariantId } from "@/lib/api";

export const Route = createFileRoute("/admin/inventory/$productId")({
  loader: async ({ params }) => {
    const response = await getV1ProductsVariantId(params.productId);

    if (response.status !== 200) {
      throw new Error("No se pudo encontrar el producto");
    }

    const variant = response.data;

    return {
      ...variant,
      components: variant.components.map(
        (c: {
          id: string;
          productId: string;
          productName: string;
          quantity: number;
          isRemovable: boolean;
        }) => ({
          id: c.id,
          productId: c.productId,
          name: c.productName,
          productName: c.productName,
          quantity: c.quantity,
          isRemovable: c.isRemovable,
        }),
      ),
    };
  },
  component: () => <Outlet />,
});
