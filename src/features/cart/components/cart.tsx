import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import { ItemCard } from "@/features/cart/components/item-card.tsx";
import { TotalCard } from "@/features/cart/components/total-card.tsx";
import { useCartStore } from "@/hooks/use-cart-store";
import { usePostV1Orders } from "@/lib/api";
import type { PostV1OrdersBody } from "@/lib/schemas";

// remempber to edit this later
// imagine if this goes into production later
// imagine if mauricio reads this code and thinks
// "what sort of mess of a project did i receive?"
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1519676867240-f03562e64548?w=160&h=160&fit=crop";

const DEFAULT_BRANCH_ID =
  import.meta.env.VITE_DEFAULT_BRANCH_ID ??
  "1c43d953-885e-4bb0-9d96-9e763be00428";

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
  const addOneToItem = useCartStore((state) => state.addOneToItem);
  const removeOneFromItem = useCartStore((state) => state.removeOneFromItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const { trigger: postOrder, isMutating: isPostingOrder } = usePostV1Orders();

  const totalCents = items.reduce(
    (sum, item) => sum + (item.unitPriceCents ?? 0) * item.quantity,
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

    console.log(items);

    const payload: PostV1OrdersBody = {
      items: items.map((item) => ({
        id: item.variantId,
        quantity: item.quantity,
        notes: item.itemNotes?.trim() || undefined,
        modifiers: item.modifiers,
      })),
      totalPriceCents: totalCents,
      branchId: DEFAULT_BRANCH_ID,
    };

    try {
      const response = await postOrder(payload);

      if (response.status === 201) {
        clearCart();
        toast.success("Pedido confirmado");
        navigate({ to: "/menu" });
        return;
      }

      toast.error("No se pudo confirmar el pedido");
    } catch {
      toast.error("No se pudo confirmar el pedido");
    }
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
                onIncrement={() => addOneToItem(item.itemId)}
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
          onConfirm={handleConfirmOrder}
          isSubmitting={isPostingOrder}
          isDisabled={items.length === 0}
        />
      </div>
    </div>
  );
}
