import { useNavigate } from "@tanstack/react-router";
import { Check, Minus, Plus, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Category } from "@/features/products/components/category-picker";
import { useCartStore } from "@/hooks/use-cart-store";
import {
  useGetV1ProductsCategories,
  useGetV1ProductsVariantId,
  useGetV1ProductsVariantsAllowed,
} from "@/lib/api";
import { formatCentsToDisplay } from "@/lib/money";
import {
  findCategoryPathById,
  normalizeCategories,
  normalizeText,
} from "./customize-product-utils.tsx";
import type { GetV1ProductsVariantsAllowed200Item } from "@/lib/schemas/getV1ProductsVariantsAllowed200Item.ts";

interface Component {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  isRemovable: boolean;
}

interface SelectedExtra {
  productId: string;
  productName: string;
  categoryName: string;
  unitPriceCents: number;
  quantity: number;
}

interface CustomizeOrderProps {
  variantId: string;
  itemId?: string;
}

export function CustomizeProduct({ variantId, itemId }: CustomizeOrderProps) {
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const updateItemCustomization = useCartStore(
    (state) => state.updateItemCustomization,
  );
  const editingItem = useCartStore((state) =>
    itemId ? state.items.find((item) => item.itemId === itemId) : undefined,
  );
  const resolvedVariantId = editingItem?.variantId ?? variantId;
  const isEditing = Boolean(itemId && editingItem);
  const { data: variantResponse, isLoading: variantLoading } =
    useGetV1ProductsVariantId(resolvedVariantId);
  const { data: categoriesResponse, isLoading: categoriesLoading } =
    useGetV1ProductsCategories();
  const { data: ingredientsResponse, isLoading: ingredientsLoading } =
    useGetV1ProductsVariantsAllowed({
      variantId,
    });

  const [removedComponents, setRemovedComponents] = useState<Set<string>>(
    new Set(),
  );
  const [addedExtras, setAddedExtras] = useState<SelectedExtra[]>([]);
  const [notes, setNotes] = useState("");
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [showIngredientDropdown, setShowIngredientDropdown] = useState(false);
  const [showAddedToCartScreen, setShowAddedToCartScreen] = useState(false);
  const [draftKey, setDraftKey] = useState<string | null>(null);

  const hasValidVariant = Boolean(
    variantResponse && variantResponse.status === 200,
  );
  const hasValidCategories = Boolean(
    categoriesResponse && categoriesResponse.status === 200,
  );

  const variant = (
    hasValidVariant
      ? variantResponse?.data
      : {
        id: "",
        name: "",
        image: null,
        price: "0",
        categoryId: "",
        path: [],
        components: [],
      }
  ) as {
    id: string;
    name: string;
    image: string | null;
    price: string;
    categoryId: string;
    path?: string[];
    components: Component[];
  };

  const categories = hasValidCategories
    ? normalizeCategories(
      categoriesResponse?.data as Category[] | { categories?: Category[] },
    )
    : [];
  const categoryPath = findCategoryPathById(categories, variant.categoryId);
  const categoryPathNames = categoryPath.map((node) => node.name);
  const resolvedPath =
    Array.isArray(variant.path) && variant.path.length > 0
      ? variant.path
      : categoryPathNames;

  const currentCategoryName = categoryPath.at(-1)?.name ?? "Sin categoría";
  const categoryLabel =
    resolvedPath.length > 0 ? resolvedPath.join(" / ") : currentCategoryName;

  const ingredientGroups =
    ingredientsResponse?.status === 200 ? ingredientsResponse.data : [];
  const ingredientOptions = ingredientGroups;

  const filteredIngredients = ingredientOptions.filter((ingredient) => {
    const query = normalizeText(ingredientSearch);
    const alreadyAdded = addedExtras.some(
      (extra) => extra.productId === ingredient.id,
    );
    if (alreadyAdded) return false;
    if (!query) return true;
    return normalizeText(ingredient.name).includes(query);
  });

  const activeComponents = variant.components.filter(
    (component) => !removedComponents.has(component.id),
  );

  const basePriceValue = Number.parseInt(variant.price, 10);
  const basePriceCents = Number.isFinite(basePriceValue) ? basePriceValue : 0;
  const extrasTotalCents = addedExtras.reduce(
    (sum, extra) => sum + extra.unitPriceCents * extra.quantity,
    0,
  );
  const totalCents = basePriceCents + extrasTotalCents;

  const toggleComponent = (component: Component) => {
    if (!component.isRemovable) return;
    setRemovedComponents((prev) => {
      const next = new Set(prev);
      if (next.has(component.id)) next.delete(component.id);
      else next.add(component.id);
      return next;
    });
  };

  const addExtra = (ingredient: GetV1ProductsVariantsAllowed200Item) => {
    setAddedExtras((prev) => {
      const existing = prev.find((extra) => extra.productId === ingredient.id);
      if (existing) {
        return prev.map((extra) =>
          extra.productId === ingredient.id
            ? { ...extra, quantity: extra.quantity + 1 }
            : extra,
        );
      }

      return [
        ...prev,
        {
          productId: ingredient.id,
          productName: ingredient.name,
          categoryName: "category",
          unitPriceCents: Number(ingredient.price),
          quantity: 1,
        },
      ];
    });

    setIngredientSearch("");
    setShowIngredientDropdown(false);
  };

  const increaseExtra = (productId: string) => {
    setAddedExtras((prev) =>
      prev.map((extra) =>
        extra.productId === productId
          ? { ...extra, quantity: extra.quantity + 1 }
          : extra,
      ),
    );
  };

  const decreaseExtra = (productId: string) => {
    setAddedExtras((prev) =>
      prev
        .map((extra) =>
          extra.productId === productId
            ? { ...extra, quantity: Math.max(0, extra.quantity - 1) }
            : extra,
        )
        .filter((extra) => extra.quantity > 0),
    );
  };

  useEffect(() => {
    if (!hasValidVariant) return;

    if (isEditing && editingItem) {
      if (ingredientsLoading) return;
      const nextKey = `edit:${editingItem.itemId}`;
      if (draftKey === nextKey) return;

      const nextRemoved = new Set<string>();
      for (const modifier of editingItem.modifiers) {
        if (modifier.delta >= 0) continue;
        const matchingComponent = variant.components.find(
          (component) => component.productId === modifier.id,
        );
        if (matchingComponent?.isRemovable) {
          nextRemoved.add(matchingComponent.id);
        }
      }

      const nextExtras = editingItem.modifiers
        .filter((modifier) => modifier.delta > 0)
        .map((modifier) => {
          const option = ingredientOptions.find(
            (item) => item.id === modifier.id,
          );
          return {
            productId: modifier.id,
            productName: option?.name ?? "Ingrediente extra",
            categoryName: "Ingrediente",
            unitPriceCents: option ? Number(option.price) : 0,
            quantity: modifier.delta,
          };
        });

      setRemovedComponents(nextRemoved);
      setAddedExtras(nextExtras);
      setNotes(editingItem.itemNotes);
      setDraftKey(nextKey);
      return;
    }

    const nextKey = `new:${variant.id}`;
    if (draftKey === nextKey) return;

    setRemovedComponents(new Set());
    setAddedExtras([]);
    setNotes("");
    setDraftKey(nextKey);
  }, [
    draftKey,
    editingItem,
    hasValidVariant,
    ingredientOptions,
    ingredientsLoading,
    isEditing,
    variant.components,
    variant.id,
  ]);

  const handleAddToCart = () => {
    if (!hasValidVariant) return;

    const removedModifiers = variant.components
      .filter((component) => removedComponents.has(component.id))
      .map((component) => ({
        id: component.productId,
        delta: -Math.max(1, component.quantity),
      }));

    const extraModifiers = addedExtras.map((extra) => ({
      id: extra.productId,
      delta: extra.quantity,
    }));

    const payload = {
      variantId: variant.id,
      itemNotes: notes.trim(),
      modifiers: [...removedModifiers, ...extraModifiers],
      displayName: variant.name,
      displayImage: variant.image ?? undefined,
      unitPriceCents: totalCents,
    };

    if (isEditing && editingItem) {
      updateItemCustomization(editingItem.itemId, payload);
    } else {
      addItem(payload);
    }

    setShowAddedToCartScreen(true);
  };

  if (variantLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <p className="text-sm text-text-main/40">Cargando...</p>
      </div>
    );
  }

  if (!hasValidVariant || !hasValidCategories) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <p className="text-sm text-red-400">Error al cargar el producto.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background-light via-background-light to-pink-soft/10 pb-64 sm:pb-56">
      <div className="max-w-3xl mx-auto px-4 pt-4 pb-8 flex flex-col gap-5 md:gap-6">
        <div className="rounded-3xl overflow-hidden border border-pink-soft/35 bg-card-light shadow-sm">
          <div className="relative h-52 sm:h-64">
            {variant.image ? (
              <img
                src={variant.image}
                alt={variant.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-pink-soft/20" />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 sm:px-5 sm:pb-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 m-0">
                Personaliza tu orden
              </p>
              <h1 className="font-display text-3xl sm:text-4xl text-white font-normal m-0 mt-1">
                {variant.name}
              </h1>
              <p className="text-white/75 text-xs sm:text-sm mt-1 m-0">
                {categoryLabel}
              </p>
            </div>
          </div>

          <div className="px-4 py-4 sm:px-5 sm:py-5 bg-background-light/70 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-main/35 m-0">
                Precio base
              </p>
              <p className="font-display text-xl text-text-main m-0 mt-1">
                ${formatCentsToDisplay(basePriceCents)}
              </p>
            </div>
            {variant.image && (
              <a
                href={variant.image}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-secondary hover:text-secondary/70 transition-colors"
              >
                Ver imagen
              </a>
            )}
          </div>
        </div>

        <section className="rounded-3xl border border-pink-soft/35 bg-card-light px-4 py-4 sm:px-5 sm:py-5 shadow-sm flex flex-col gap-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-main/35 m-0">
            Ingredientes base
          </p>
          <div className="grid grid-cols-1 gap-2">
            {variant.components.map((component) => {
              const isRemoved = removedComponents.has(component.id);
              return (
                <article
                  key={component.id}
                  className={`rounded-2xl border px-3 py-3 transition-colors ${isRemoved
                      ? "border-red-200/70 bg-red-50/45"
                      : "border-pink-soft/30 bg-background-light"
                    }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p
                        className={`text-sm m-0 ${isRemoved
                            ? "line-through text-text-main/35"
                            : "text-text-main"
                          }`}
                      >
                        {component.productName}
                      </p>
                      <p className="text-[11px] text-text-main/40 m-0 mt-1">
                        Cantidad base: {component.quantity}
                      </p>
                    </div>
                    {component.isRemovable ? (
                      <button
                        type="button"
                        onClick={() => toggleComponent(component)}
                        className={`rounded-xl px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-all cursor-pointer ${isRemoved
                            ? "border border-pink-soft/40 text-text-main/60 bg-background-light"
                            : "border border-red-200 text-red-500 bg-red-50 hover:bg-red-100"
                          }`}
                      >
                        {isRemoved ? "Reactivar" : "Quitar"}
                      </button>
                    ) : (
                      <span className="text-[11px] text-text-main/35">
                        Fijo
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-pink-soft/35 bg-card-light px-4 py-4 sm:px-5 sm:py-5 shadow-sm flex flex-col gap-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-main/35 m-0">
            Agregar ingredientes
          </p>

          {ingredientsLoading ? (
            <div className="rounded-2xl border border-pink-soft/20 bg-background-light px-4 py-3 text-xs text-text-main/35">
              Cargando ingredientes...
            </div>
          ) : ingredientOptions.length === 0 ? (
            <div className="rounded-2xl border border-pink-soft/20 bg-background-light px-4 py-3 text-xs text-text-main/35">
              No hay ingredientes disponibles para esta categoría.
            </div>
          ) : (
            <div className="relative">
              <div className="flex items-center gap-2 rounded-xl border border-pink-soft/30 bg-background-light px-3 py-2.5">
                <Search className="w-4 h-4 text-text-main/30" />
                <input
                  type="text"
                  value={ingredientSearch}
                  onChange={(event) => {
                    setIngredientSearch(event.target.value);
                    setShowIngredientDropdown(true);
                  }}
                  onFocus={() => setShowIngredientDropdown(true)}
                  onBlur={() =>
                    setTimeout(() => setShowIngredientDropdown(false), 150)
                  }
                  placeholder="Buscar ingrediente para agregar"
                  className="w-full bg-transparent text-sm text-text-main placeholder:text-text-main/30 focus:outline-none"
                />
              </div>

              {showIngredientDropdown && filteredIngredients.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-1 max-h-56 overflow-auto rounded-xl border border-pink-soft/30 bg-card-light shadow-sm">
                  {filteredIngredients.map((ingredient) => (
                    <button
                      key={ingredient.id}
                      type="button"
                      onMouseDown={() => addExtra(ingredient)}
                      className="w-full text-left px-3 py-2.5 border-b border-pink-soft/10 last:border-b-0 hover:bg-pink-soft/10 transition-colors cursor-pointer"
                    >
                      <span className="block text-sm text-text-main">
                        {ingredient.name}
                      </span>
                      <span className="block text-[11px] text-text-main/35">
                        Categoria · +$
                        {formatCentsToDisplay(ingredient.price)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {addedExtras.length > 0 && (
            <div className="grid grid-cols-1 gap-2 mt-1">
              {addedExtras.map((extra) => (
                <article
                  key={extra.productId}
                  className="rounded-2xl border border-secondary/20 bg-secondary/5 px-3 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-text-main m-0">
                        {extra.productName}
                      </p>
                      <p className="text-[11px] text-text-main/40 m-0 mt-0.5">
                        {extra.categoryName} · $
                        {formatCentsToDisplay(extra.unitPriceCents)} c/u
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => decreaseExtra(extra.productId)}
                      className="text-text-main/25 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => decreaseExtra(extra.productId)}
                      className="w-7 h-7 rounded-lg border border-pink-soft/30 flex items-center justify-center text-text-main/55 hover:text-text-main transition-colors cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-semibold text-text-main min-w-8 text-center">
                      {extra.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => increaseExtra(extra.productId)}
                      className="w-7 h-7 rounded-lg border border-pink-soft/30 flex items-center justify-center text-text-main/55 hover:text-text-main transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-pink-soft/35 bg-card-light px-4 py-4 sm:px-5 sm:py-5 shadow-sm flex flex-col gap-2">
          <label
            htmlFor="notes"
            className="text-[10px] font-bold uppercase tracking-widest text-text-main/35"
          >
            Notas adicionales
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="¿Alguna alergia o petición especial?"
            rows={3}
            className="w-full bg-background-light border border-pink-soft/30 rounded-xl px-4 py-3 text-sm text-text-main placeholder:text-text-main/25 focus:outline-none focus:border-pink-soft/60 transition-colors resize-none"
          />
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-60 border-t border-pink-soft/30 bg-card-light/95 shadow-[0_-8px_24px_rgba(0,0,0,0.12)] backdrop-blur-sm px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-text-main/50 m-0">
              {activeComponents.length} ingrediente
              {activeComponents.length !== 1 ? "s" : ""}
              {removedComponents.size > 0
                ? `, ${removedComponents.size} eliminado${removedComponents.size !== 1 ? "s" : ""}`
                : ""}
            </p>
            <p className="text-base font-semibold text-text-main m-0 mt-0.5">
              Total: ${formatCentsToDisplay(totalCents)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full sm:w-auto bg-charcoal text-white rounded-xl px-5 sm:px-6 py-4 text-base sm:text-sm font-bold uppercase tracking-wide hover:bg-charcoal/90 active:scale-[0.99] transition-all cursor-pointer whitespace-nowrap"
          >
            {isEditing ? "Guardar cambios" : "Añadir al carrito"} · $
            {formatCentsToDisplay(totalCents)}
          </button>
        </div>
      </div>

      {showAddedToCartScreen && (
        <div className="fixed inset-0 z-70 bg-black/45 backdrop-blur-[2px] px-4 py-6 flex items-end sm:items-center justify-center">
          <div className="w-full max-w-md rounded-3xl border border-pink-soft/40 bg-card-light shadow-xl p-5 sm:p-6 flex flex-col gap-4">
            <div className="w-10 h-10 rounded-full bg-secondary/15 text-secondary flex items-center justify-center">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-text-main/40 m-0">
                Listo
              </p>
              <h2 className="font-display text-3xl text-text-main font-normal m-0 mt-1">
                {isEditing ? "Cambios guardados" : "Producto agregado"}
              </h2>
              <p className="text-sm text-text-main/55 m-0 mt-1.5">
                {isEditing
                  ? "Tu producto personalizado fue actualizado en el carrito."
                  : "Tu orden personalizada ya esta en el carrito."}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => navigate({ to: "/menu" })}
                className="w-full rounded-xl border border-pink-soft/40 px-4 py-3 text-sm font-bold uppercase tracking-wide text-text-main bg-background-light hover:bg-pink-soft/10 transition-colors cursor-pointer"
              >
                Seguir comprando
              </button>
              <button
                type="button"
                onClick={() => navigate({ to: "/cart" })}
                className="w-full rounded-xl bg-charcoal px-4 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-charcoal/90 transition-colors cursor-pointer"
              >
                Ir al carrito
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
