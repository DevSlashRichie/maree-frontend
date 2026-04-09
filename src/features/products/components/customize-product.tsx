import { Minus, Plus, X } from "lucide-react";
import { useState } from "react";
import type { Category } from "@/features/products/components/category-picker";
import {
  useGetV1ProductsCategories,
  useGetV1ProductsVariantId,
} from "@/lib/api";
import { getIngredientGroupsForCategory } from "./customize-product-utils.tsx";

interface Component {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  isRemovable: boolean;
}

interface SelectedExtra {
  componentId: string;
  productId: string;
  productName: string;
  price: string;
  quantity: number;
}

interface CustomizeOrderProps {
  variantId: string;
}

export function CustomizeProduct({ variantId }: CustomizeOrderProps) {
  const { data: variantResponse, isLoading: variantLoading } =
    useGetV1ProductsVariantId(variantId);
  const { data: categoriesResponse, isLoading: categoriesLoading } =
    useGetV1ProductsCategories();

  const [removedComponents, setRemovedComponents] = useState<Set<string>>(
    new Set(),
  );
  const [addedExtras, setAddedExtras] = useState<SelectedExtra[]>([]);
  const [notes, setNotes] = useState("");

  if (variantLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <p className="text-sm text-text-main/40">Cargando...</p>
      </div>
    );
  }

  if (
    !variantResponse ||
    variantResponse.status !== 200 ||
    !categoriesResponse ||
    categoriesResponse.status !== 200
  ) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <p className="text-sm text-red-400">Error al cargar el producto.</p>
      </div>
    );
  }

  const variant = variantResponse.data;
  const categories: Category[] = categoriesResponse.data;
  const ingredientGroups = getIngredientGroupsForCategory(
    categories,
    variant.categoryId,
  );

  const activeComponents = variant.components.filter(
    (c) => !removedComponents.has(c.id),
  );

  const basePrice = parseFloat(variant.price);
  const extrasTotal = addedExtras.reduce(
    (sum, e) => sum + parseFloat(e.price) * e.quantity,
    0,
  );
  const total = basePrice + extrasTotal;

  const toggleComponent = (component: Component) => {
    if (!component.isRemovable) return;
    setRemovedComponents((prev) => {
      const next = new Set(prev);
      if (next.has(component.id)) next.delete(component.id);
      else next.add(component.id);
      return next;
    });
  };

  const addExtra = (cat: Category) => {
    setAddedExtras((prev) => {
      const existing = prev.find((e) => e.productId === cat.id);
      if (existing) {
        return prev.map((e) =>
          e.productId === cat.id ? { ...e, quantity: e.quantity + 1 } : e,
        );
      }
      return [
        ...prev,
        {
          componentId: "",
          productId: cat.id,
          productName: cat.name,
          price: "15",
          quantity: 1,
        },
      ];
    });
  };

  const removeExtra = (productId: string) => {
    setAddedExtras((prev) => prev.filter((e) => e.productId !== productId));
  };

  return (
    <div className="min-h-screen bg-background-light pb-28">
      <div className="relative w-full h-72 overflow-hidden">
        {variant.image ? (
          <img
            src={variant.image}
            alt={variant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-pink-soft/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 px-6 pb-6">
          <h1 className="font-display text-4xl text-white font-normal m-0">
            {variant.name}
          </h1>
          <p className="text-white/60 text-sm mt-1">
            {variant.components.length} ingredientes incluidos
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-8 flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-normal text-text-main m-0">
              Tu Selección
            </h2>
            <span className="font-display text-2xl text-text-main">
              ${total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <hr className="border-pink-soft/20 m-0" />
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-main/30 m-0">
            Ingredientes base
          </p>
          <div className="bg-card-light rounded-2xl border border-pink-soft/40 px-4">
            {variant.components.map((component) => {
              const isRemoved = removedComponents.has(component.id);
              return (
                <div
                  key={component.id}
                  className="flex items-center justify-between py-3 border-b border-pink-soft/20 last:border-0"
                >
                  <span
                    className={`text-sm transition-colors ${isRemoved ? "line-through text-text-main/25" : "text-text-main"}`}
                  >
                    {component.productName}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-text-main/40 font-mono">
                      Incl.
                    </span>
                    {component.isRemovable ? (
                      <button
                        type="button"
                        onClick={() => toggleComponent(component)}
                        className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all cursor-pointer active:scale-95 ${isRemoved
                            ? "border-pink-soft/30 bg-background-light text-text-main/30 hover:border-pink-soft/60"
                            : "border-pink-soft/40 bg-background-light text-text-main/50 hover:border-red-300 hover:text-red-400"
                          }`}
                      >
                        {isRemoved ? (
                          <Plus className="w-3 h-3" />
                        ) : (
                          <X className="w-3 h-3" />
                        )}
                      </button>
                    ) : (
                      <div className="w-6 h-6 rounded-full border border-pink-soft/20 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-pink-soft/30" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {ingredientGroups.map((group) => (
          <div key={group.id} className="flex flex-col gap-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-main/30 m-0">
              {group.name}
            </p>
            <div className="flex flex-wrap gap-2">
              {(group.children ?? []).map((ingredient) => {
                const added = addedExtras.find(
                  (e) => e.productId === ingredient.id,
                );
                return (
                  <div key={ingredient.id} className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => addExtra(ingredient)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all cursor-pointer active:scale-95 ${added
                          ? "bg-secondary/10 border-secondary/30 text-secondary"
                          : "bg-card-light border-pink-soft/40 text-text-main/70 hover:border-pink-soft hover:bg-pink-soft/10 hover:text-text-main"
                        }`}
                    >
                      {added && (
                        <span className="font-mono text-xs font-bold">
                          {added.quantity}×
                        </span>
                      )}
                      {ingredient.name}
                      <span className="text-xs text-text-main/40 font-mono">
                        +$15
                      </span>
                    </button>
                    {added && (
                      <button
                        type="button"
                        onClick={() => removeExtra(ingredient.id)}
                        className="w-5 h-5 rounded-full flex items-center justify-center text-text-main/20 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="flex flex-col gap-2">
          <label
            htmlFor="notes"
            className="text-[10px] font-bold uppercase tracking-widest text-text-main/30"
          >
            Notas adicionales
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="¿Alguna alergia o petición especial?"
            rows={3}
            className="w-full bg-card-light border border-pink-soft/30 rounded-xl px-4 py-3 text-sm text-text-main placeholder:text-text-main/25 focus:outline-none focus:border-pink-soft/60 transition-colors resize-none"
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background-light/90 backdrop-blur-sm border-t border-pink-soft/20 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <div className="flex-1">
            {addedExtras.length > 0 && (
              <div className="flex flex-col gap-0.5 mb-1">
                {addedExtras.map((e) => (
                  <p
                    key={e.productId}
                    className="text-[11px] text-text-main/40 m-0"
                  >
                    + {e.productName} ×{e.quantity} — $
                    {(parseFloat(e.price) * e.quantity).toLocaleString(
                      "es-MX",
                      { minimumFractionDigits: 2 },
                    )}
                  </p>
                ))}
              </div>
            )}
            <p className="text-xs text-text-main/40 m-0">
              {activeComponents.length} ingrediente
              {activeComponents.length !== 1 ? "s" : ""}
              {removedComponents.size > 0 &&
                `, ${removedComponents.size} eliminado${removedComponents.size !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            type="button"
            className="bg-charcoal text-white rounded-xl px-6 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-charcoal/90 active:scale-[0.99] transition-all cursor-pointer whitespace-nowrap"
          >
            Añadir al Carrito — $
            {total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
          </button>
        </div>
      </div>
    </div>
  );
}
