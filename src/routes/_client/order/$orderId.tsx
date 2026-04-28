import { createFileRoute } from "@tanstack/react-router";
import { Loader2, AlertCircle } from "lucide-react";
import { OrderDetail } from "@/features/admin/components/order-details";
import { requireAuth } from "@/hooks/with-auth";
import { useGetV1OrdersMeId } from "@/lib/api";
import { useAuthStore } from "@/hooks/use-auth-store";

export const Route = createFileRoute("/_client/order/$orderId")({
  beforeLoad: async ({ location }) => {
    await requireAuth({ location, navigateTo: "/login" });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { orderId } = Route.useParams();
  const { actor } = useAuthStore();
  const { data: response, isLoading, error } = useGetV1OrdersMeId(orderId);

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

  if (error || response?.status !== 200) {
    return (
      <div className="min-h-100 flex flex-col items-center justify-center gap-4">
        <div className="p-4 rounded-full bg-red-50">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <p className="font-display font-bold text-red-500 text-lg">
          No se encontró el pedido
        </p>
      </div>
    );
  }

  return (
    <OrderDetail
      order={response.data as any}
      backTo="/order"
      backLabel="Volver a mis pedidos"
      showReview={true}
      actorId={actor?.id}
    />
  );
}
