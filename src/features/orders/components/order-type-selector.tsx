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
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 bg-secondary/30 px-5 py-4 rounded-2xl border-2 border-transparent hover:border-accent transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="bg-secondary p-2 rounded-xl">
            <MapPin className="w-5 h-5 text-accent" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-charcoal/50">
              Sucursal
            </p>
            <p className="font-bold text-text-main">
              {selected?.name ?? "Selecciona una"}
            </p>
          </div>
        </div>
        <div
          className={`w-6 h-6 rounded-full border-2 border-accent flex items-center justify-center ${selected ? "bg-accent" : ""}`}
        >
          {selected && <Check className="w-3 h-3 text-white" />}
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
          {branches.map((branch) => (
            <button
              key={branch.id}
              type="button"
              onClick={() => {
                onSelect(branch);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
                selectedId === branch.id ? "bg-secondary/30" : ""
              }`}
            >
              <span className="font-medium">{branch.name}</span>
              {selectedId === branch.id && (
                <Check className="w-4 h-4 text-accent" />
              )}
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
  const discountId = useCartStore((state) => state.discountId);
  const rewardId = useCartStore((state) => state.rewardId);
  const clearCart = useCartStore((state) => state.clearCart);
  const clearDiscount = useCartStore((state) => state.clearDiscount);

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
      <h2 className="font-display text-2xl sm:text-3xl text-text-main text-center mb-6 leading-tight">
        ¿A dónde quieres
        <br />
        mandar tu pedido?
      </h2>
      {isLoading ? (
        <div className="w-full flex items-center justify-center gap-3 bg-secondary/30 px-5 py-4 rounded-2xl mb-8">
          <span className="text-sm font-medium text-charcoal/70">
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

      <h3 className="font-display text-xl sm:text-2xl text-text-main text-center mb-6 leading-tight">
        ¿Cómo lo quieres
        <br />
        recibir?
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-10">
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
