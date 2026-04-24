import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  ChevronDown,
  LogIn,
  MapPin,
  ShoppingBag,
  Utensils,
} from "lucide-react";
import { Fragment, useState } from "react";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/modal";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useBranchStore } from "@/hooks/use-branch-store";
import { useCartStore } from "@/hooks/use-cart-store";
import { useGetV1Branches, usePostV1Orders } from "@/lib/api";
import type { GetV1Branches200Item, PostV1OrdersBody } from "@/lib/schemas";

function ClientBranchSelector() {
  const { selectedBranch, setSelectedBranch } = useBranchStore();
  const { data, isLoading } = useGetV1Branches();

  const branches = data?.status === 200 ? data.data : [];

  if (isLoading) {
    return (
      <div className="h-8 w-40 rounded-full bg-secondary/50 animate-pulse" />
    );
  }

  return (
    <Popover className="relative">
      {({ open, close }) => (
        <>
          <PopoverButton
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border transition-all duration-200 outline-none cursor-pointer ${
              open
                ? "bg-primary text-white border-primary"
                : "bg-secondary/50 text-charcoal/70 border-primary/5 hover:border-primary/20"
            }`}
          >
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-wider truncate max-w-[140px]">
              {selectedBranch ? selectedBranch.name : "Selecciona sucursal"}
            </span>
            <ChevronDown
              className={`w-3 h-3 shrink-0 transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
            />
          </PopoverButton>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1 scale-95"
            enterTo="opacity-100 translate-y-0 scale-100"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0 scale-100"
            leaveTo="opacity-0 translate-y-1 scale-95"
          >
            <PopoverPanel className="absolute left-1/2 -translate-x-1/2 mt-2 w-56 z-50">
              <div className="rounded-2xl shadow-xl border border-secondary/20 bg-white overflow-hidden">
                <div className="px-4 py-3 border-b border-secondary/10">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-text-main/40 font-semibold">
                    Sucursal
                  </p>
                </div>
                <div className="py-1 max-h-60 overflow-y-auto">
                  {branches.length === 0 ? (
                    <p className="px-4 py-3 text-xs text-text-main/40">
                      No hay sucursales disponibles
                    </p>
                  ) : (
                    branches.map((branch: GetV1Branches200Item) => {
                      const isSelected = selectedBranch?.id === branch.id;
                      return (
                        <button
                          key={branch.id}
                          type="button"
                          onClick={() => {
                            setSelectedBranch(
                              branch as {
                                id: string;
                                name: string;
                                state: string;
                              },
                            );
                            close();
                          }}
                          className={`w-full flex items-center justify-between px-4 py-2.5 transition-colors duration-150 ${
                            isSelected
                              ? "bg-secondary/5"
                              : "hover:bg-secondary/5"
                          }`}
                        >
                          <span
                            className={`text-sm font-semibold ${
                              isSelected
                                ? "text-text-main"
                                : "text-text-main/80"
                            }`}
                          >
                            {branch.name}
                          </span>
                          {isSelected && (
                            <Check className="w-4 h-4 text-accent shrink-0" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </PopoverPanel>
          </Transition>
        </>
      )}
    </Popover>
  );
}

function LoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}) {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error("Ingresa tu número de teléfono");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8383/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (response.ok && data.actor) {
        setAuth(data.actor, data.expiresAt);
        onLoginSuccess();
        onClose();
        toast.success("Sesión iniciada");
      } else {
        toast.error(data.message || "Error al iniciar sesión");
      }
    } catch {
      toast.error("Error al conectar con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Iniciar Sesión">
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <p className="text-sm text-text-main/70">
          Ingresa tu número de teléfono para continuar con tu pedido.
        </p>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Ej: 4421234567"
          className="w-full px-4 py-3 border border-secondary/30 rounded-xl focus:ring-2 focus:ring-secondary/30 outline-none"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-charcoal transition-colors disabled:opacity-50"
        >
          {isLoading ? "Iniciando..." : "Continuar"}
        </button>
      </form>
    </Modal>
  );
}

export default function OrderTypeSelector() {
  const navigate = useNavigate();
  const [orderType, setOrderType] = useState<"mesa" | "recoger">("mesa");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { selectedBranch } = useBranchStore();
  const { isAuthenticated } = useAuthStore();
  const { items, clearCart } = useCartStore();
  const { trigger: postOrder } = usePostV1Orders();

  const totalCents = items.reduce(
    (sum, item) => sum + (item.unitPriceCents ?? 0) * item.quantity,
    0,
  );

  const handleConfirmOrder = async () => {
    if (!selectedBranch) {
      toast.error("Selecciona una sucursal");
      return;
    }

    if (items.length === 0) {
      toast.error("Tu carrito está vacío");
      return;
    }

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: PostV1OrdersBody = {
        items: items.map((item) => ({
          id: item.variantId,
          quantity: item.quantity,
          notes: item.itemNotes?.trim() || undefined,
          modifiers: item.modifiers,
        })),
        totalPriceCents: totalCents,
        branchId: selectedBranch.id,
        status: "pending",
      };

      const response = await postOrder(payload);

      if (response.status === 201) {
        clearCart();
        toast.success("Pedido confirmado");
        navigate({ to: "/menu" });
      } else {
        toast.error("No se pudo confirmar el pedido");
      }
    } catch {
      toast.error("No se pudo confirmar el pedido");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSuccess = () => {
    handleConfirmOrder();
  };

  return (
    <>
      <div className="w-full max-w-md mx-auto bg-card-light rounded-[2.5rem] shadow-xl p-6 sm:p-10 flex flex-col items-center relative">
        <div className="mb-6">
          <ClientBranchSelector />
        </div>

        <h2 className="font-display text-2xl sm:text-3xl text-text-main text-center mb-8 leading-tight">
          ¿Cómo recibirás tu pedido?
        </h2>

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
            </div>
          </button>
        </div>

        <button
          type="button"
          onClick={handleConfirmOrder}
          disabled={!selectedBranch || isSubmitting}
          className="w-full bg-primary text-white py-4.5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-charcoal transition-colors shadow-lg active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {!isAuthenticated && <LogIn className="w-5 h-5" />}
          <span className="tracking-wide uppercase text-sm">
            {isSubmitting ? "Confirmando..." : "Ordenar ahora"}
          </span>
          {!isSubmitting && <ArrowRight className="w-5 h-5" />}
        </button>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}
