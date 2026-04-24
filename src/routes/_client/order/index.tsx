import { createFileRoute, Link } from "@tanstack/react-router";
import { Heading } from "@/components/typography";
import { HistoryItem } from "@/components/ui/history-item";
import { requireAuth } from "@/hooks/with-auth";
import { useGetV1OrdersMe } from "@/lib/api";
import { formatPrice } from "@/lib/money";

export const Route = createFileRoute("/_client/order/")({
  beforeLoad: async ({ location }) => {
    await requireAuth({ location, navigateTo: "/login" });
  },

  pendingComponent: () => (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg text-muted-foreground">Loading...</p>
    </div>
  ),
  component: RouteComponent,
});

function RouteComponent() {
  const { data: response, isLoading, error } = useGetV1OrdersMe();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-soft" />
      </div>
    );
  }

  if (error || response?.status !== 200) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <h2 className="text-2xl font-display text-gray-800 mb-4">
          ¡Ups! Algo salió mal
        </h2>
        <p className="text-gray-600 mb-8 max-w-md">
          No pudimos cargar tus pedidos en este momento. Por favor, intenta de
          nuevo más tarde.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-pink-soft text-white rounded-full hover:bg-pink-soft/90 transition-colors shadow-lg"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const orders = response.data;

  return (
    <div className="texture-bg min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="mb-12">
          <div className="flex flex-col gap-3 border-l-4 border-charcoal pl-8">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-charcoal" />
              <span className="text-[10px] font-bold tracking-[0.4em] text-charcoal uppercase">
                Tu historial de
              </span>
            </div>
            <Heading className="text-4xl md:text-4xl font-display lowercase italic tracking-tight text-gray-900">
              mis pedidos
            </Heading>
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-sm rounded-3xl overflow-hidden border border-pink-soft/10 shadow-sm">
          {orders.length > 0 ? (
            <ul className="divide-y divide-pink-soft/10">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  to="/order/$orderId"
                  params={{ orderId: order.id }}
                  className="block"
                >
                  <HistoryItem
                    title={`Pedido #${order.orderNumber}`}
                    location={formatPrice(order.total)}
                    date={order.createdAt}
                    status={order.status}
                  />
                </Link>
              ))}
            </ul>
          ) : (
            <div className="py-20 text-center">
              <p className="text-gray-500 mb-8 font-body italic">
                Aún no has realizado ningún pedido.
              </p>
              <Link
                to="/"
                className="inline-block px-8 py-3 bg-charcoal text-white rounded-full hover:bg-charcoal/90 transition-colors shadow-md font-bold uppercase tracking-widest text-xs"
              >
                Ver el menú
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
