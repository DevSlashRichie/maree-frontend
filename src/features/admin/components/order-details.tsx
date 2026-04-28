import { Link } from "@tanstack/react-router";
import { ChevronLeft, Clock, Hash, Package } from "lucide-react";
import { Heading } from "@/components/typography";
import ReviewForm from "@/features/review/components/review-form";
import { formatPrice } from "@/lib/money";

type OrderItem = {
  id: string;
  quantity: number;
  pricingSnapshot?: number;
  notes?: string;
  productVariantsTable?: { name: string };
  modifiers?: Array<{
    id: string;
    productVariantsTable?: { name: string };
  }>;
};

export type OrderDetailData = {
  id: string;
  userId: string;
  branchId: string;
  total: string | number;
  status: string;
  note?: string | null;
  orderNumber: string;
  orderType: string;
  createdAt: string;
  items?: OrderItem[];
};

type OrderDetailProps = {
  order: OrderDetailData;
  backTo?: string;
  backLabel?: string;
  showReview?: boolean;
  actorId?: string;
};

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> =
  {
    pending: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      dot: "bg-amber-400",
    },
    confirmed: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      dot: "bg-blue-400",
    },
    preparing: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      dot: "bg-purple-400",
    },
    ready: {
      bg: "bg-teal-50",
      text: "text-teal-700",
      dot: "bg-teal-400",
    },
    delivered: {
      bg: "bg-green-50",
      text: "text-green-700",
      dot: "bg-green-400",
    },
    cancelled: {
      bg: "bg-red-50",
      text: "text-red-600",
      dot: "bg-red-400",
    },
  };

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status.toLowerCase()] ?? {
    bg: "bg-gray-50",
    text: "text-gray-600",
    dot: "bg-gray-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-current/10 ${style.bg} ${style.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
}

export function OrderDetail({
  order,
  backTo,
  backLabel = "Volver",
  showReview = false,
  actorId,
}: OrderDetailProps) {
  const shortNumber = order.orderNumber.substring(order.orderNumber.length - 6);

  return (
    <div className="texture-bg min-h-screen pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-12">
        {backTo && (
          <Link
            to={backTo}
            className="flex items-center gap-2 text-charcoal/60 hover:text-charcoal transition-colors mb-8 group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold uppercase tracking-widest text-[10px]">
              {backLabel}
            </span>
          </Link>
        )}

        <div className="mb-10">
          <div className="flex flex-col gap-3 border-l-4 border-charcoal pl-8">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-charcoal" />
              <span className="text-[10px] font-bold tracking-[0.4em] text-charcoal uppercase">
                Detalles del
              </span>
            </div>
            <Heading className="text-4xl md:text-4xl font-display tracking-tight text-gray-900">
              pedido #<span className="lowercase">{shortNumber}</span>
            </Heading>
          </div>
        </div>

        <div className="space-y-6">
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
                  <StatusBadge status={order.status} />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-pink-soft/10 flex items-center justify-center text-pink-soft">
                  <Hash className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                    Tipo
                  </p>
                  <p className="text-sm font-bold uppercase text-charcoal">
                    {order.orderType}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end justify-center">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">
                Total del pedido
              </p>
              <p className="text-3xl font-display text-charcoal">
                {formatPrice(Number(order.total))}
              </p>
            </div>
          </div>

          {order.items && order.items.length > 0 && (
            <div className="bg-white/50 backdrop-blur-sm rounded-3xl overflow-hidden border border-pink-soft/10 shadow-sm">
              <div className="p-6 border-b border-pink-soft/10 bg-white/30">
                <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-charcoal">
                  Productos
                </h3>
              </div>
              <div className="divide-y divide-pink-soft/10">
                {order.items.map((item) => (
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
                ))}
              </div>
            </div>
          )}

          {order.note && (
            <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-6 border border-pink-soft/10">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-3">
                Nota del pedido
              </p>
              <p className="text-sm italic text-charcoal/80">"{order.note}"</p>
            </div>
          )}

          {showReview && actorId && (
            <div className="pt-8">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-3 w-full">
                  <span className="h-px flex-grow bg-charcoal/10" />
                  <span className="text-[10px] font-bold tracking-[0.4em] text-charcoal/40 uppercase whitespace-nowrap">
                    ¿Qué te pareció?
                  </span>
                  <span className="h-px flex-grow bg-charcoal/10" />
                </div>
                <ReviewForm
                  orderId={order.id}
                  userId={actorId}
                  branchId={order.branchId}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
