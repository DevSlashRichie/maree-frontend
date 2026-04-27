import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, MapPin, ShoppingBag, Utensils } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useBranchStore } from "@/hooks/use-branch-store";
import { useCartStore } from "@/hooks/use-cart-store";
import { useGetV1Branches, usePostV1Orders } from "@/lib/api";
import type { GetV1Branches200Item, PostV1OrdersBody } from "@/lib/schemas";

interface BranchSelectorProps {
  branches: GetV1Branches200Item[];
  selectedId: string | null;
  onSelect: (branch: GetV1Branches200Item) => void;
}

function BranchSelector({
  branches,
  selectedId,
  onSelect,
}: BranchSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = branches.find((b) => b.id === selectedId);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 bg-secondary/50 px-4 py-1.5 rounded-full mb-6 border border-primary/5 hover:bg-secondary/70 transition-colors"
      >
        <MapPin className="w-3.5 h-3.5 text-accent" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/70">
          {selected?.name ?? "Selecciona Sucursal"}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
          {branches.map((branch) => (
            <button
              key={branch.id}
              type="button"
              onClick={() => {
                onSelect(branch);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
                selectedId === branch.id ? "bg-secondary/30" : ""
              }`}
            >
              <span>{branch.name}</span>
              {selectedId === branch.id && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrderTypeSelector() {
  const [orderType, setOrderType] = useState<"mesa" | "recoger">("mesa");
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setSelectedBranch } = useBranchStore();
  const items = useCartStore((state) => state.items);

  const clearCart = useCartStore((state) => state.clearCart);
  const clearDiscount = useCartStore((state) => state.clearDiscount);
  const discountId = useCartStore((state) => state.discountId);
  const rewardId = useCartStore((state) => state.rewardId);

  const { data, isLoading } = useGetV1Branches();
  const { trigger: postOrder, isMutating } = usePostV1Orders();

  const branches =
    data?.status === 200 ? data.data.filter((b) => b.state === "active") : [];
  const selectedBranch = branches.find((b) => b.id === selectedBranchId);

  const totalCents = items.reduce(
    (sum, item) => sum + (item.unitPriceCents ?? 0) * item.quantity,
    0,
  );

  const handleOrdenar = async () => {
    if (!selectedBranch) {
      toast.error("Selecciona una sucursal");
      return;
    }

    if (items.length === 0) {
      toast.error("Tu carrito está vacío");
      return;
    }

    const payload: PostV1OrdersBody = {
      items: items.map((item) => ({
        id: item.variantId,
        quantity: item.quantity,
        notes: item.itemNotes?.trim() || undefined,
        modifiers: item.modifiers,
        isDiscounted: item.isDiscounted ?? false,
        discountAmountCents: item.discountAmountCents ?? 0,
      })),
      totalPriceCents: totalCents,
      branchId: selectedBranch.id,
      orderType,
      ...(discountId && { discountId }),
      ...(rewardId && { rewardId }),
    };

    try {
      const response = await postOrder(payload);

      if (response.status === 201) {
        clearCart();
        clearDiscount();
        setSelectedBranch({
          id: selectedBranch.id,
          name: selectedBranch.name,
          state: selectedBranch.state,
        });
        toast.success("Pedido confirmado");
        navigate({ to: "/order" });
        return;
      }

      toast.error("No se pudo confirmar el pedido");
    } catch {
      toast.error("No se pudo confirmar el pedido");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-card-light rounded-[2.5rem] shadow-xl p-6 sm:p-10 flex flex-col items-center relative">
      {/* Branch Location Badge */}
      {isLoading ? (
        <div className="flex items-center gap-1.5 bg-secondary/50 px-4 py-1.5 rounded-full mb-6">
          <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/70">
            Cargando...
          </span>
        </div>
      ) : (
        <BranchSelector
          branches={branches}
          selectedId={selectedBranchId}
          onSelect={(branch) => setSelectedBranchId(branch.id)}
        />
      )}

      <h2 className="font-display text-2xl sm:text-3xl text-text-main text-center mb-8 leading-tight">
        ¿Cómo recibirás tu pedido?
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-10">
        {/* Dine-in Option */}
        <button
          type="button"
          onClick={() => setOrderType("mesa")}
          className={`relative p-5 sm:p-6 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center gap-3 ${
            orderType === "mesa"
              ? "border-accent bg-pink-powder/40 shadow-sm"
              : "border-transparent bg-background-light hover:bg-secondary/50"
          }`}
        >
          {orderType === "mesa" && (
            <div className="absolute top-3 right-3">
              <div className="rounded-full border border-accent p-0.5">
                <div className="w-2 h-2 bg-accent rounded-full" />
              </div>
            </div>
          )}
          <div className="bg-secondary p-4 rounded-2xl">
            <Utensils className="w-6 h-6 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-bold text-text-main text-lg">Para Mesa</p>
            <p className="text-xs text-charcoal/60">Servicio a tu mesa</p>
          </div>
        </button>

        {/* Pickup Option */}
        <button
          type="button"
          onClick={() => setOrderType("recoger")}
          className={`relative p-5 sm:p-6 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center gap-3 ${
            orderType === "recoger"
              ? "border-accent bg-pink-powder/40 shadow-sm"
              : "border-transparent bg-background-light hover:bg-secondary/50"
          }`}
        >
          {orderType === "recoger" && (
            <div className="absolute top-3 right-3">
              <div className="rounded-full border border-accent p-0.5">
                <div className="w-2 h-2 bg-accent rounded-full" />
              </div>
            </div>
          )}
          <div className="bg-secondary p-4 rounded-2xl">
            <ShoppingBag className="w-6 h-6 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-bold text-text-main text-lg">Para Recoger</p>
            <p className="text-xs text-charcoal/60">Listo en 15-20 min</p>
          </div>
        </button>
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={handleOrdenar}
        disabled={!selectedBranchId || isMutating}
        className="w-full bg-primary text-white py-4.5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-charcoal transition-colors shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="tracking-wide uppercase text-sm">
          {isMutating ? "Confirmando..." : "Ordenar ahora"}
        </span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
