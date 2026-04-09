import { Minus, Plus, X } from "lucide-react";
import { QtyButton } from "./qty-button";

interface ItemCardProps {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  imageUrl: string;
  modifyLink: string;
  onRemove?: () => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
}

export function ItemCard({
  name,
  description,
  price,
  quantity,
  imageUrl,
  modifyLink,
  onRemove,
  onIncrement,
  onDecrement,
}: ItemCardProps) {
  return (
    <div className="relative bg-card-light rounded-2xl border border-pink-soft/40 px-5 py-4 flex items-center gap-5">
      <div className="group/remove absolute top-3 right-4">
        <button
          type="button"
          onClick={onRemove}
          className="w-5 h-5 rounded-full bg-white border border-pink-soft/40 flex items-center justify-center text-text-main/30 hover:text-red-400 hover:border-red-300 active:scale-95 transition-all cursor-pointer"
        >
          <X className="w-2.5 h-2.5" />
        </button>
        <span className="pointer-events-none absolute -top-7 right-0 whitespace-nowrap bg-charcoal text-white text-[10px] font-medium px-2 py-1 rounded-md opacity-0 group-hover/remove:opacity-100 transition-opacity">
          Eliminar
        </span>
      </div>

      <img
        src={imageUrl}
        alt={name}
        className="w-20 h-20 rounded-full object-cover shrink-0"
      />

      <div className="flex-1 flex flex-col justify-between min-w-0 py-1">
        <div>
          <h3 className="font-display text-lg font-normal text-text-main m-0">
            {name}
          </h3>
          {description && (
            <p className="text-sm text-text-main/40 mt-0.5 m-0">
              {description}
            </p>
          )}
        </div>
        <a
          href={modifyLink}
          className="text-[10px] font-bold uppercase tracking-widest text-secondary mt-3 w-fit no-underline hover:underline"
        >
          Modificar
        </a>
      </div>

      <div className="flex items-center gap-3 shrink-0 self-end pb-1">
        <QtyButton
          onClick={onDecrement}
          icon={<Minus className="w-3 h-3" />}
          tooltip="Quitar uno"
        />
        <span className="font-mono text-sm text-text-main w-4 text-center">
          {quantity}
        </span>
        <QtyButton
          onClick={onIncrement}
          icon={<Plus className="w-3 h-3" />}
          tooltip="Agregar uno"
        />
        <span className="font-display text-base text-text-main min-w-[64px] text-right">
          ${price.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}
