import { createFileRoute, Outlet } from "@tanstack/react-router";
import { getV1ProductsVariantId } from "@/lib/api";
import { formatPrice } from "@/lib/money";

export const Route = createFileRoute("/admin/inventory/$productId")({
  loader: async ({ params }) => {
    const response = await getV1ProductsVariantId(params.productId);

    if (response.status !== 200) {
      throw new Error("No se pudo encontrar el producto");
    }

    const variant = response.data;

    return {
      id: variant.id,
      name: variant.name,
      image: variant.image,
      price: formatPrice(Number(variant.price)),
      priceInCents: Number(variant.price),
      description: variant.description,
      status: variant.status,
      categoryId: variant.categoryId,
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
