import { ArrowRight, X } from "lucide-react";
import { formatCentsToDisplay } from "@/lib/money";

interface TotalCardProps {
  totalCents: number;
  discountAmountCents?: number;
  onConfirm?: () => void;
  isSubmitting?: boolean;
  isDisabled?: boolean;
  discountName?: string;
  discountValue?: bigint;
  discountType?: string;
  onClearDiscount?: () => void;
}

export function TotalCard({
  totalCents,
  discountAmountCents,
  onConfirm,
  isSubmitting = false,
  isDisabled = false,
  discountName,
  discountValue,
  discountType,
  onClearDiscount,
}: TotalCardProps) {
  let itemDiscountAmount = discountAmountCents ?? 0;

  let orderDiscountAmount = 0;
  if (discountValue && discountType) {
    const discountValueNum = Number(discountValue);

    if (discountType === "percentage") {
      const basisPoints = discountValueNum > 100 ? discountValueNum : discountValueNum * 100;
      orderDiscountAmount = Math.floor((totalCents * basisPoints) / 10000);
    } else {
      orderDiscountAmount = discountValueNum;
    }
  }

  const totalDiscountAmount = itemDiscountAmount + orderDiscountAmount;
  const finalTotal = Math.max(0, totalCents - totalDiscountAmount);

  return (
    <div className="bg-card-light rounded-2xl border border-pink-soft/40 px-4 sm:px-5 py-4 sm:py-5 flex flex-col gap-4">
      <h2 className="font-display text-xl font-normal text-text-main m-0">
        Resumen de Pago
      </h2>
      <hr className="border-pink-soft/20 m-0" />

      {/* Subtotal */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-main/60 m-0">Subtotal</p>
        <p className="font-display text-lg text-text-main m-0">
          ${formatCentsToDisplay(totalCents)}
        </p>
      </div>

      {/* Discount */}
      {discountName && totalDiscountAmount > 0 && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-sm text-text-main/60 m-0">{discountName}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="font-display text-lg text-accent m-0">
                -${formatCentsToDisplay(totalDiscountAmount)}
              </p>
              {onClearDiscount && (
                <button
                  type="button"
                  onClick={onClearDiscount}
                  className="text-text-main/40 hover:text-text-main transition-colors p-1"
                  title="Remover descuento"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <hr className="border-pink-soft/20 m-0" />
        </>
      )}

      {/* Total */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-main/60 m-0">Total</p>
        <p className="font-display text-xl text-text-main m-0">
          ${formatCentsToDisplay(finalTotal)}
        </p>
      </div>

      <button
        type="button"
        onClick={onConfirm}
        disabled={isDisabled || isSubmitting}
        className="w-full bg-charcoal text-white rounded-xl py-3.5 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest hover:bg-charcoal/90 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-charcoal disabled:active:scale-100"
      >
        {isSubmitting ? "Enviando pedido..." : "Confirmar Pedido"}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
