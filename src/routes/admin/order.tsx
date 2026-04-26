import { createFileRoute } from "@tanstack/react-router";
import { BranchSelector } from "@/features/admin/components/selector-branch";
import { Orders } from "@/features/orders/components/orders";

export const Route = createFileRoute("/admin/order")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <div className="p-6 border-b border-secondary/20 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-display text-4xl text-text-main font-bold mb-2 uppercase tracking-wide">
              Pedidos
            </h1>
            <p className="font-body text-text-main/60">
              Gestiona los pedidos de cada sucursal
            </p>
          </div>
          <BranchSelector />
        </div>
      </div>
      <Orders />
    </div>
  );
}
