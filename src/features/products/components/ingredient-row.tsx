import { Minus, Plus, Trash2 } from "lucide-react";
import type { SelectedIngredient } from "../data/mock";

interface IngredientRowProps {
  ingredient: SelectedIngredient;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemovableToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

export function IngredientRow({
  ingredient,
  onQuantityChange,
  onRemovableToggle,
  onRemove,
}: IngredientRowProps) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-pink-soft/20 last:border-0">
      <span className="flex-1 min-w-0">
        <span className="block truncate text-sm text-text-main font-medium">
          {ingredient.productName}
        </span>
        <span className="block truncate text-[11px] text-text-main/35">
          {ingredient.categoryName}
        </span>
      </span>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() =>
            onQuantityChange(
              ingredient.id,
              Math.max(1, ingredient.quantity - 1),
            )
          }
          className="w-6 h-6 rounded-full border border-pink-soft/40 bg-background-light flex items-center justify-center text-text-main/50 hover:bg-pink-soft/10 hover:text-text-main active:scale-95 transition-all cursor-pointer"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="font-mono text-sm text-text-main w-4 text-center">
          {ingredient.quantity}
        </span>
        <button
          type="button"
          onClick={() =>
            onQuantityChange(ingredient.id, ingredient.quantity + 1)
          }
          className="w-6 h-6 rounded-full border border-pink-soft/40 bg-background-light flex items-center justify-center text-text-main/50 hover:bg-pink-soft/10 hover:text-text-main active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => onRemovableToggle(ingredient.id)}
        className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
          ingredient.isRemovable
            ? "bg-secondary/10 border-secondary/30 text-secondary"
            : "bg-background-light border-pink-soft/30 text-text-main/30"
        }`}
      >
        Removible
      </button>

      <button
        type="button"
        onClick={() => onRemove(ingredient.id)}
        className="text-text-main/20 hover:text-red-400 transition-colors cursor-pointer"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
