import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/inventory/products")({
  component: () => (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-4xl text-text-main font-bold mb-2 uppercase tracking-wide">
          Productos
        </h1>
        <p className="font-body text-text-main/60">Próximamente...</p>
      </div>
    </div>
  ),
});
