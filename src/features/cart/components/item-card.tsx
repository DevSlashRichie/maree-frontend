import { Minus, Pencil, Plus, Tag, Trash2 } from "lucide-react";
import { formatCentsToDisplay } from "@/lib/money";

interface ItemCardProps {
  id: string;
  name: string;
  description?: string;
  unitPriceCents: number;
  quantity: number;
  imageUrl: string;
  isDiscounted?: boolean;
  discountAmountCents?: number;
  onRemove?: () => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
  onCustomize?: () => void;
}

export function ItemCard({
  id,
  name,
  description,
  unitPriceCents,
  quantity,
  imageUrl,
  isDiscounted,
  discountAmountCents,
  onRemove,
  onIncrement,
  onDecrement,
  onCustomize,
}: ItemCardProps) {
  const lineTotalCents = unitPriceCents * quantity;
  const finalLineTotalCents = isDiscounted
    ? Math.max(0, lineTotalCents - (discountAmountCents ?? 0))
    : lineTotalCents;

  return (
    <article
      className="bg-card-light rounded-2xl border border-pink-soft/35 p-3 sm:p-4 flex flex-col gap-3"
      data-item-id={id}
    >
      <div className="flex items-start gap-3">
        <img
          src={imageUrl}
          alt={name}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 border border-pink-soft/20"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-xl sm:text-2xl font-normal text-text-main m-0 leading-tight">
              {name}
            </h3>
            {isDiscounted && (
              <div className="flex items-center gap-1 bg-accent/20 px-2 py-1 rounded-full">
                <Tag className="w-3 h-3 text-accent" />
                <span className="text-xs font-semibold text-accent">
                  Descuento
                </span>
              </div>
            )}
          </div>
          {description && (
            <p className="text-xs sm:text-sm text-text-main/55 mt-1 m-0 line-clamp-3">
              {description}
            </p>
          )}
          <p className="text-xs text-text-main/45 m-0 mt-1.5">
            Precio unitario: ${formatCentsToDisplay(unitPriceCents)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2 rounded-xl border border-pink-soft/35 bg-background-light px-2 py-1.5">
          <button
            type="button"
            onClick={onDecrement}
            disabled={quantity <= 1}
            className="w-9 h-9 rounded-lg border border-pink-soft/35 bg-white flex items-center justify-center text-text-main/60 hover:text-text-main disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="Quitar uno"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-text-main min-w-7 text-center">
            {quantity}
          </span>
          <button
            type="button"
            onClick={onIncrement}
            className="w-9 h-9 rounded-lg border border-pink-soft/35 bg-white flex items-center justify-center text-text-main/60 hover:text-text-main transition-colors cursor-pointer"
            aria-label="Agregar uno"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <p className="font-display text-lg sm:text-xl text-text-main m-0">
          ${formatCentsToDisplay(finalLineTotalCents)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onCustomize}
          disabled={!onCustomize}
          className="rounded-xl border border-pink-soft/35 bg-background-light px-3 py-2.5 text-[11px] sm:text-xs font-bold uppercase tracking-wide text-text-main/60 flex items-center justify-center gap-1.5 disabled:opacity-45 disabled:cursor-not-allowed hover:bg-pink-soft/10 transition-colors cursor-pointer"
        >
          <Pencil className="w-3.5 h-3.5" />
          Personalizar
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[11px] sm:text-xs font-bold uppercase tracking-wide text-red-500 flex items-center justify-center gap-1.5 hover:bg-red-100 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Quitar
        </button>
      </div>
    </article>
  );
}
