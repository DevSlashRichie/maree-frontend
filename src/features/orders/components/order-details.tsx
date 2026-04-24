import { Button } from "@/components/button.tsx";
import type { GetV1Orders200Item, GetV1OrdersMeId200 } from "@/lib/schemas";

interface OrderDetailsProps {
  order: GetV1Orders200Item;
  orderDetails: GetV1OrdersMeId200 | null;
  isLoadingDetails: boolean;
  onForward: () => void;
  onBackward?: () => void;
}

export function OrderDetails({
  order,
  orderDetails,
  isLoadingDetails,
  onForward,
  onBackward,
}: OrderDetailsProps) {
  const forwardLabel: Record<string, string> = {
    pending: "Aceptar",
    set: "Listo",
    ready: "Completar",
  };

  const items = orderDetails?.items ?? [];

  return (
    <div className="bg-card-light rounded-2xl border border-pink-soft/40 px-5 py-6 flex flex-col gap-5">
      <div className="flex items-baseline gap-3">
        <p className="font-display text-lg text-text-main">
          {`${order.user?.firstName} ${order.user?.lastName}`}
        </p>
        <p className="font-mono text-[11px] uppercase tracking-widest text-text-main/40">
          Orden #{order.order.orderNumber}
        </p>
        <p className="font-display text-lg text-text-main ml-auto">
          ${order.order.total}
        </p>
      </div>

      <hr className="border-pink-soft/20" />

      <div className="flex flex-col gap-2">
        {isLoadingDetails ? (
          <p className="text-sm text-text-main/50">Cargando items...</p>
        ) : items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-text-main">
                {item.quantity}x {item.productVariantsTable?.name ?? "Producto"}
              </span>
              <span className="text-text-main/70">${item.pricingSnapshot}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-text-main/50">Sin items</p>
        )}
      </div>

      <hr className="border-pink-soft/20" />

      <div className="flex justify-end gap-3">
        {onBackward && (
          <Button variant="action" onClick={onBackward}>
            Regresar
          </Button>
        )}
        <Button variant="action" onClick={onForward}>
          {forwardLabel[order.order.status] ?? "Aceptar"}
        </Button>
      </div>
    </div>
  );
}
