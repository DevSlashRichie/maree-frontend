import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { ProductForm } from "@/features/products/components/create-product";

export const Route = createFileRoute("/admin/inventory/$productId/")({
  component: EditProductPage,
});

const productIdRoute = getRouteApi("/admin/inventory/$productId");

function EditProductPage() {
  const data = productIdRoute.useLoaderData();

  return (
    <div className="py-6">
      <ProductForm initialData={data} />
    </div>
  );
}
