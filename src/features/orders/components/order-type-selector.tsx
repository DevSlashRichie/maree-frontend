import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  ChevronDown,
  MapPin,
  ShoppingBag,
  Utensils,
} from "lucide-react";
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
    // Portal-style: position relative on this wrapper, overflow visible on parent
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
        <div className="flex items-center gap-2">
          {selected ? (
            <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          ) : (
            <ChevronDown
              className={`w-5 h-5 text-charcoal/40 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          )}
        </div>
      </button>

      {/* Dropdown renders outside the card via z-index; parent must NOT have overflow:hidden */}
      {isOpen && (
        <>
          {/* Backdrop to close on outside click */}
          <button
            type="button"
            aria-label="Cerrar selector de sucursal"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
            {branches.map((branch) => (
              <button
                key={branch.id}
                type="button"
                onClick={() => {
                  onSelect(branch);
                  setIsOpen(false);
                }}
                className={`w-full px-5 py-3.5 text-left text-sm hover:bg-secondary/20 flex items-center justify-between transition-colors ${
                  selectedId === branch.id ? "bg-secondary/30" : ""
                }`}
              >
                <span className="font-medium text-text-main">
                  {branch.name}
                </span>
                {selectedId === branch.id && (
                  <Check className="w-4 h-4 text-accent" />
                )}
              </button>
            ))}
          </div>
        </>
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

  const { data, isLoading } = useGetV1Branches({ state: "active" });
  const { trigger: postOrder, isMutating } = usePostV1Orders();

  const branches = data?.status === 200 ? data.data : [];
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
    // KEY FIX: overflow-visible so the branch dropdown can escape the card bounds
    <div className="w-full max-w-md mx-auto bg-card-light rounded-[2.5rem] shadow-xl p-6 sm:p-10 flex flex-col items-center relative overflow-visible">
      {/* Title */}
      <h2 className="font-display text-2xl sm:text-3xl text-text-main text-center mb-6 leading-tight">
        ¿A dónde quieres
        <br />
        mandar tu pedido?
      </h2>

      {/* Branch selector */}
      <div className="w-full mb-8">
        {isLoading ? (
          <div className="w-full flex items-center justify-center gap-3 bg-secondary/30 px-5 py-4 rounded-2xl">
            <span className="text-sm font-medium text-charcoal/70">
              Cargando sucursales...
            </span>
          </div>
        ) : (
          <BranchSelector
            branches={branches}
            selectedId={selectedBranchId}
            onSelect={(branch) => setSelectedBranchId(branch.id)}
          />
        )}
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-secondary/60 mb-8" />

      {/* Order type title */}
      <h3 className="font-display text-2xl sm:text-3xl text-text-main text-center mb-6 leading-tight">
        ¿Cómo lo quieres
        <br />
        recibir?
      </h3>

      {/* Order type buttons */}
      <div className="grid grid-cols-2 gap-4 w-full mb-10">
        {(["mesa", "recoger"] as const).map((type) => {
          const isSelected = orderType === type;
          const isMesa = type === "mesa";
          return (
            <button
              key={type}
              type="button"
              onClick={() => setOrderType(type)}
              className={`relative p-5 sm:p-6 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center gap-3 ${
                isSelected
                  ? "border-accent bg-pink-powder/40 shadow-sm"
                  : "border-transparent bg-background-light hover:bg-secondary/50"
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <div className="rounded-full border border-accent p-0.5">
                    <div className="w-2 h-2 bg-accent rounded-full" />
                  </div>
                </div>
              )}
              <div className="bg-secondary p-4 rounded-2xl">
                {isMesa ? (
                  <Utensils className="w-6 h-6 text-primary" />
                ) : (
                  <ShoppingBag className="w-6 h-6 text-primary" />
                )}
              </div>
              <div className="text-center">
                <p className="font-bold text-text-main text-base sm:text-lg">
                  {isMesa ? "Para Mesa" : "Para Recoger"}
                </p>
                <p className="text-xs text-charcoal/60 mt-0.5">
                  {isMesa ? "Servicio a tu mesa" : "Listo en 15-20 min"}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={handleOrdenar}
        disabled={!selectedBranchId || isMutating}
        className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-charcoal transition-colors shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="tracking-wide uppercase text-sm">
          {isMutating ? "Confirmando..." : "Ordenar ahora"}
        </span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
