import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, Loader2 } from "lucide-react";
import { useMemo } from "react";
import { OrderDetail } from "@/features/admin/components/order-details";
import { useGetV1Orders } from "@/lib/api";

export const Route = createFileRoute("/admin/orders/$orderId")({
  component: AdminOrderDetailComponent,
});

function AdminOrderDetailComponent() {
  const { orderId } = Route.useParams();
  const { data: response, isLoading, error } = useGetV1Orders();

  const order = useMemo(() => {
    if (response?.status === 200) {
      const orderRow = response.data.find((o) => o.order.id === orderId);
      return orderRow?.order || null;
    }
    return null;
  }, [response, orderId]);

  if (isLoading) {
    return (
      <div className="min-h-100 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
        <p className="text-text-main/60 font-body animate-pulse">
          Cargando pedido...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-100 flex flex-col items-center justify-center gap-4">
        <div className="p-4 rounded-full bg-red-50">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <p className="font-display font-bold text-red-500 text-lg">
          No se encontró el pedido
        </p>
        <Link
          to="/admin/orders"
          className="text-sm text-secondary underline underline-offset-2"
        >
          Volver a pedidos
        </Link>
      </div>
    );
  }

  return (
    <OrderDetail
      order={order}
      backTo="/admin/orders"
      backLabel="Volver a pedidos"
      showReview={true}
    />
  );
}
