import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Clock, Package } from "lucide-react";
import { Heading } from "@/components/typography";
import { requireAuth } from "@/hooks/with-auth";
import { useGetV1OrdersMeId } from "@/lib/api";
import { formatPrice } from "@/lib/money";

export const Route = createFileRoute("/_client/order/$orderId")({
  beforeLoad: async ({ location }) => {
    await requireAuth({ location, navigateTo: "/login" });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { orderId } = Route.useParams();
  const { data: response, isLoading, error } = useGetV1OrdersMeId(orderId);

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
          ¡Ups! No pudimos encontrar el pedido
        </h2>
        <Link
          to="/order"
          className="px-6 py-2 bg-pink-soft text-white rounded-full hover:bg-pink-soft/90 transition-colors shadow-lg"
        >
          Volver a mis pedidos
        </Link>
      </div>
    );
  }

  const order = response.data;

  return (
    <div className="texture-bg min-h-screen pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-12">
        <Link
          to="/order"
          className="flex items-center gap-2 text-charcoal/60 hover:text-charcoal transition-colors mb-8 group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold uppercase tracking-widest text-[10px]">
            Volver a mis pedidos
          </span>
        </Link>

        <div className="mb-10">
          <div className="flex flex-col gap-3 border-l-4 border-charcoal pl-8">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-charcoal" />
              <span className="text-[10px] font-bold tracking-[0.4em] text-charcoal uppercase">
                Detalles del
              </span>
            </div>
            <Heading className="text-4xl md:text-4xl font-display lowercase italic tracking-tight text-gray-900">
              pedido #{order.orderNumber}
            </Heading>
          </div>
        </div>

        <div className="space-y-6">
          {/* Status and Info Card */}
          <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 border border-pink-soft/10 shadow-sm flex flex-col md:flex-row gap-6 justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-pink-soft/10 flex items-center justify-center text-pink-soft">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                    Fecha
                  </p>
                  <p className="text-sm font-medium">
                    {new Date(order.createdAt).toLocaleString("es-CL", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-pink-soft/10 flex items-center justify-center text-pink-soft">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                    Estado
                  </p>
                  <p className="text-sm font-bold uppercase text-charcoal">
                    {order.status}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end justify-center">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">
                Total del pedido
              </p>
              <p className="text-3xl font-display text-charcoal">
                {formatPrice(order.total)}
              </p>
            </div>
          </div>

          {/* Items Section */}
          <div className="bg-white/50 backdrop-blur-sm rounded-3xl overflow-hidden border border-pink-soft/10 shadow-sm">
            <div className="p-6 border-b border-pink-soft/10 bg-white/30">
              <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-charcoal">
                Productos
              </h3>
            </div>
            <div className="divide-y divide-pink-soft/10">
              {order.items && order.items.length > 0 ? (
                order.items.map((item) => (
                  <div key={item.id} className="p-6 flex justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-pink-soft/5 rounded-2xl flex items-center justify-center text-charcoal font-bold border border-pink-soft/10">
                        {item.quantity}x
                      </div>
                      <div>
                        <p className="font-bold text-charcoal">
                          {item.productVariantsTable?.name || "Producto"}
                        </p>
                        {item.modifiers && item.modifiers.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {item.modifiers.map((mod) => (
                              <span
                                key={mod.id}
                                className="text-[10px] bg-charcoal/5 text-charcoal/60 px-2 py-0.5 rounded-full"
                              >
                                + {mod.productVariantsTable?.name}
                              </span>
                            ))}
                          </div>
                        )}
                        {item.notes && (
                          <p className="mt-2 text-xs italic text-gray-500">
                            "{item.notes}"
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-bold text-charcoal">
                        {formatPrice(item.pricingSnapshot || 0)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center italic text-gray-400">
                  No se encontraron detalles de los productos.
                </div>
              )}
            </div>
          </div>

          {/* Notes Card */}
          {order.note && (
            <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-6 border border-pink-soft/10">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-3">
                Nota del pedido
              </p>
              <p className="text-sm italic text-charcoal/80">"{order.note}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
