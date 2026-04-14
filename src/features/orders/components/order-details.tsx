import { Button } from "@/components/button.tsx";
import type { GetV1Orders200Item } from "@/lib/schemas";

interface OrderDetailsProps {
  order: GetV1Orders200Item;
  onForward: () => void;
  onBackward?: () => void;
}

export function OrderDetails({
  order,
  onForward,
  onBackward,
}: OrderDetailsProps) {
  const forwardLabel: Record<string, string> = {
    pending: "Aceptar",
    set: "Listo",
    ready: "Completar",
  };

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

      {/* TODO: reemplazar con fetch real de items cuando esté el endpoint */}
      <div className="flex flex-wrap gap-3 items-stretch">
        <p className="text-sm text-text-main/50">Cargando items...</p>
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
