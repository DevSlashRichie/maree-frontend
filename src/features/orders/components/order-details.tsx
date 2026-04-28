import { Button } from "@/components/button.tsx";
import type { GetV1Orders200Item, GetV1OrdersId200 } from "@/lib/schemas";

interface OrderDetailsProps {
  order: GetV1Orders200Item;
  orderDetails: GetV1OrdersId200 | null;
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
    <div className="bg-card-light rounded-2xl border border-pink-soft/40 px-6 py-8 flex flex-col gap-5 max-h-[80vh] overflow-y-auto">
      <div className="flex items-baseline gap-3 flex-wrap">
        <p className="font-display text-xl text-text-main font-semibold">
          {`${order.user?.firstName} ${order.user?.lastName}`}
        </p>
        <p className="font-mono text-[11px] uppercase tracking-widest text-text-main/40">
          Orden #{order.order.orderNumber}
        </p>
        {order.order.orderType && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              order.order.orderType === "mesa"
                ? "bg-secondary text-text-main"
                : "bg-pink-soft/30 text-text-main"
            }`}
          >
            {order.order.orderType === "mesa" ? "Para Mesa" : "Para Recoger"}
          </span>
        )}
        <p className="font-display text-xl text-text-main ml-auto font-semibold">
          ${order.order.total}
        </p>
      </div>

      {order.order.note && (
        <>
          <hr className="border-pink-soft/20" />
          <div className="bg-pink-soft/10 rounded-xl p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-text-main/50 mb-1">
              Nota:
            </p>
            <p className="text-sm text-text-main">{order.order.note}</p>
          </div>
        </>
      )}

      <hr className="border-pink-soft/20" />

      <div className="flex flex-col gap-3">
        <p className="text-xs font-bold uppercase tracking-wider text-text-main/50">
          Items del pedido
        </p>
        {isLoadingDetails ? (
          <p className="text-sm text-text-main/50 py-4 text-center">
            Cargando items...
          </p>
        ) : items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center py-2 border-b border-pink-soft/10 last:border-0"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-text-main">
                  {item.quantity}x{" "}
                  {item.productVariantsTable?.name ?? "Producto"}
                </p>
                {item.notes && (
                  <p className="text-xs text-text-main/50 mt-0.5">
                    {item.notes}
                  </p>
                )}
              </div>
              <p className="text-sm text-text-main/70 font-medium">
                ${Number(item.pricingSnapshot) / 100}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-text-main/50 py-4 text-center">
            Sin items
          </p>
        )}
      </div>

      <hr className="border-pink-soft/20" />

      <div className="flex justify-end gap-3 pt-2">
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
