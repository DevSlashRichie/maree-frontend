import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Gift, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import { ItemCard } from "@/features/cart/components/item-card.tsx";
import { TotalCard } from "@/features/cart/components/total-card.tsx";
import { useCartStore } from "@/hooks/use-cart-store";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1519676867240-f03562e64548?w=160&h=160&fit=crop";

function buildItemDescription(modifiers: { delta: number }[], notes: string) {
  const removedCount = modifiers
    .filter((modifier) => modifier.delta < 0)
    .reduce((sum, modifier) => sum + Math.abs(modifier.delta), 0);
  const addedCount = modifiers
    .filter((modifier) => modifier.delta > 0)
    .reduce((sum, modifier) => sum + modifier.delta, 0);

  const parts: string[] = [];
  if (removedCount > 0)
    parts.push(`${removedCount} ingrediente(s) removido(s)`);
  if (addedCount > 0) parts.push(`${addedCount} ingrediente(s) extra`);
  if (notes) parts.push(`Nota: ${notes}`);

  return parts.join(" · ");
}

export function Cart() {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const discountId = useCartStore((state) => state.discountId);
  const rewardId = useCartStore((state) => state.rewardId);
  const discount = useCartStore((state) => state.discount);
  const pendingDiscount = useCartStore((state) => state.pendingDiscount);
  const clearDiscount = useCartStore((state) => state.clearDiscount);
  const addOneToItem = useCartStore((state) => state.addOneToItem);
  const removeOneFromItem = useCartStore((state) => state.removeOneFromItem);
  const removeItem = useCartStore((state) => state.removeItem);

  const totalCents = items.reduce(
    (sum, item) => sum + (item.unitPriceCents ?? 0) * item.quantity,
    0,
  );

  const discountAmountCents = items.reduce(
    (sum, item) => sum + (item.discountAmountCents ?? 0),
    0,
  );

  const handleConfirmOrder = async () => {
    if (items.length === 0) {
      toast.error("Tu carrito esta vacio");
      return;
    }

    if (items.some((item) => !item.variantId)) {
      toast.error("Hay productos invalidos en el carrito");
      return;
    }

    navigate({ to: "/order-setup" });
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-background-light via-background-light to-pink-soft/10 pb-28 sm:pb-10">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8 flex flex-col gap-6 sm:gap-8">
        <Link
          to="/menu"
          className="flex items-center gap-1.5 text-sm text-text-main/55 hover:text-text-main transition-colors w-fit no-underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Seguir Comprando
        </Link>

        <div className="flex flex-col gap-1">
          <h1 className="font-display text-4xl sm:text-5xl font-normal text-text-main m-0 leading-none">
            Mi Orden
          </h1>
          <p className="text-sm text-text-main/50 m-0">
            Revisa tu selección antes de confirmar.
          </p>
        </div>

        {pendingDiscount && (
          <div className="rounded-2xl border border-accent/40 bg-accent/10 px-5 py-4 flex items-start gap-3">
            <Gift className="w-5 h-5 text-accent mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-display text-sm font-semibold text-accent m-0">
                Descuento Listo
              </p>
              <p className="text-xs text-text-main/70 m-0 mt-1">
                Agrega un artículo al carrito para aplicar tu descuento "
                {pendingDiscount.discount.name}".
              </p>
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="rounded-3xl border border-pink-soft/35 bg-card-light px-5 py-8 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-pink-soft/25 flex items-center justify-center text-text-main/45">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <p className="font-display text-2xl text-text-main m-0">
              Tu carrito esta vacio
            </p>
            <p className="text-sm text-text-main/50 m-0">
              Agrega productos desde el menu para empezar tu pedido.
            </p>
            <Link
              to="/menu"
              className="mt-1 rounded-xl bg-charcoal px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white no-underline"
            >
              Ir al menu
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <ItemCard
                key={item.itemId}
                id={item.itemId}
                name={item.displayName ?? "Producto personalizado"}
                description={buildItemDescription(
                  item.modifiers,
                  item.itemNotes,
                )}
                unitPriceCents={item.unitPriceCents ?? 0}
                quantity={item.quantity}
                imageUrl={item.displayImage ?? FALLBACK_IMAGE}
                isDiscounted={item.isDiscounted}
                discountAmountCents={item.discountAmountCents}
                onIncrement={
                  item.isDiscounted
                    ? undefined
                    : () => addOneToItem(item.itemId)
                }
                onDecrement={() => removeOneFromItem(item.itemId)}
                onRemove={() => removeItem(item.itemId)}
                onCustomize={() =>
                  navigate({
                    to: "/customize-product",
                    search: {
                      itemId: item.itemId,
                      variantId: item.variantId,
                    },
                  })
                }
              />
            ))}
          </div>
        )}

        <TotalCard
          totalCents={totalCents}
          discountAmountCents={discountAmountCents}
          discountName={discount?.name}
          discountType={discount?.type}
          discountValue={discount?.value}
          onConfirm={handleConfirmOrder}
          isSubmitting={false}
          isDisabled={items.length === 0}
          onClearDiscount={clearDiscount}
        />
      </div>
    </div>
  );
}
