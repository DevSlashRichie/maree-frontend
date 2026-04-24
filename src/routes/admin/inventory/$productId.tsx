import { createFileRoute } from "@tanstack/react-router";
import { ProductForm } from "@/features/products/components/create-product";

export const Route = createFileRoute("/admin/inventory/$productId")({
  loader: async ({ params }) => {
    const response = await fetch(
      `http://localhost:8383/v1/products/variant/${params.productId}`,
    );

    if (!response.ok) {
      throw new Error("No se pudo encontrar el producto");
    }

    return response.json();
  },
  component: EditProductPage,
});

function EditProductPage() {
  const data = Route.useLoaderData();

  return (
    <div className="py-6">
      <ProductForm initialData={data} />
    </div>
  );
}
