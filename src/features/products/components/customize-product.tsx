import { useNavigate } from "@tanstack/react-router";
import { Check, Minus, Plus, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCartStore } from "@/hooks/use-cart-store";
import {
  useGetV1ProductsVariantId,
  useGetV1ProductsVariants,
  useGetV1ProductsVariantsAllowed,
} from "@/lib/api";
import { formatCentsToDisplay } from "@/lib/money";
import type { GetV1ProductsVariantsAllowed200Item } from "@/lib/schemas/getV1ProductsVariantsAllowed200Item.ts";
import { normalizeText } from "./customize-product-utils.tsx";

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
  unitPriceCents: number;
  quantity: number;
}

interface CustomizeOrderProps {
  variantId: string;
  itemId?: string;
}

// Sub-component for Category Search and Picked List
function ArmaCategorySelector({
  label,
  options,
  selectedIds,
  onAdd,
  onRemove,
  totalSelected,
  maxLimit,
}: {
  label: string;
  options: GetV1ProductsVariantsAllowed200Item[];
  selectedIds: string[];
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  totalSelected: number;
  maxLimit: number;
}) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const isLimitReached = totalSelected >= maxLimit;

  const filtered = useMemo(() => {
    const query = normalizeText(search);
    return options.filter((opt) => {
      const isAlreadyPicked = selectedIds.includes(opt.id);
      if (isAlreadyPicked) return false;
      if (!query) return true;
      return normalizeText(opt.name).includes(query);
    });
  }, [options, search, selectedIds]);

  const selectedIngredients = useMemo(
    () =>
      selectedIds
        .map((id) => options.find((opt) => opt.id === id))
        .filter(Boolean) as GetV1ProductsVariantsAllowed200Item[],
    [selectedIds, options],
  );

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold text-text-main/60">{label}</p>

      <div className="relative">
        <div
          className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 bg-background-light transition-all ${
            isLimitReached
              ? "bg-gray-50 border-pink-soft/20"
              : "border-pink-soft/30 hover:border-pink-soft/60"
          }`}
        >
          <Search className="w-4 h-4 text-text-main/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            placeholder={
              isLimitReached
                ? `Límite alcanzado (${totalSelected}/${maxLimit})`
                : `Buscar ${label.toLowerCase()}...`
            }
            disabled={isLimitReached}
            className="w-full bg-transparent text-sm text-text-main placeholder:text-text-main/30 focus:outline-none disabled:cursor-not-allowed"
          />
        </div>

        {isOpen && !isLimitReached && filtered.length > 0 && (
          <div className="absolute z-30 left-0 right-0 mt-1 max-h-48 overflow-auto rounded-xl border border-pink-soft/30 bg-card-light shadow-lg">
            {filtered.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onMouseDown={() => {
                  onAdd(opt.id);
                  setSearch("");
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2.5 border-b border-pink-soft/10 last:border-b-0 hover:bg-pink-soft/10 transition-colors"
              >
                <span className="block text-sm text-text-main">{opt.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedIngredients.length > 0 && (
        <div className="flex flex-col gap-2">
          {selectedIngredients.map((ing) => (
            <div
              key={ing.id}
              className="flex items-center justify-between gap-3 bg-secondary/5 border border-secondary/20 rounded-xl px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-sm text-text-main truncate">{ing.name}</p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(ing.id)}
                className="text-text-main/25 hover:text-red-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
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
  const isEditing = Boolean(itemId && editingItem);

  const [removedComponents, setRemovedComponents] = useState<Set<string>>(
    new Set(),
  );
  const [addedExtras, setAddedExtras] = useState<SelectedExtra[]>([]);
  const [selectedArma, setSelectedArma] = useState<{
    untables: string[];
    fruta: string[];
    toppings: string[];
  }>({
    untables: [],
    fruta: [],
    toppings: [],
  });

  const totalArmaSelected =
    selectedArma.untables.length +
    selectedArma.fruta.length +
    selectedArma.toppings.length;

  const { data: allVariantsResponse } = useGetV1ProductsVariants();

  const armaVariantsMap = useMemo(() => {
    if (allVariantsResponse?.status !== 200) return {};
    const variants = allVariantsResponse.data.variants ?? [];
    return variants
      .filter((v) => v.name.toLowerCase().includes("arma tu crepa"))
      .reduce(
        (acc, v) => {
          const match = v.name.match(/\((\d+)\s+ingrediente/i);
          if (match) {
            acc[Number.parseInt(match[1], 10)] = v.id;
          }
          return acc;
        },
        {} as Record<number, string>,
      );
  }, [allVariantsResponse]);

  const isInitialArma = useMemo(() => {
    if (allVariantsResponse?.status === 200 && allVariantsResponse.data) {
      const v = allVariantsResponse?.data?.variants?.find(
        (v) => v.id === (editingItem?.variantId ?? variantId),
      );
      return v?.name.toLowerCase().includes("arma tu crepa") ?? false;
    }

    return [];
  }, [allVariantsResponse, variantId, editingItem?.variantId]);

  const targetVariantId = useMemo(() => {
    if (isInitialArma && totalArmaSelected > 0) {
      const counts = Object.keys(armaVariantsMap)
        .map(Number)
        .sort((a, b) => b - a);
      const bestCount =
        counts.find((c) => c <= totalArmaSelected) || counts[counts.length - 1];
      if (bestCount && armaVariantsMap[bestCount]) {
        return armaVariantsMap[bestCount];
      }
    }
    return editingItem?.variantId ?? variantId;
  }, [
    isInitialArma,
    totalArmaSelected,
    armaVariantsMap,
    variantId,
    editingItem?.variantId,
  ]);

  const resolvedVariantId = editingItem?.variantId ?? variantId;

  const { data: variantResponse, isLoading: variantLoading } =
    useGetV1ProductsVariantId(resolvedVariantId);
  const { data: ingredientsResponse, isLoading: ingredientsLoading } =
    useGetV1ProductsVariantsAllowed({ variantId: resolvedVariantId });
  const [notes, setNotes] = useState("");
  const [baseType, setBaseType] = useState<"Crepa" | "Waffle">("Crepa");
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [showIngredientDropdown, setShowIngredientDropdown] = useState(false);
  const [showAddedToCartScreen, setShowAddedToCartScreen] = useState(false);
  const [draftKey, setDraftKey] = useState<string | null>(null);

  const hasValidVariant = Boolean(
    variantResponse && variantResponse.status === 200,
  );

  const variant = useMemo(
    () =>
      (hasValidVariant
        ? variantResponse?.data
        : {
            id: "",
            name: "",
            image: null,
            price: "0",
            categoryId: "",
            path: [],
            components: [],
          }) as {
        id: string;
        name: string;
        image: string | null;
        price: string;
        categoryId: string;
        path?: string[];
        components: Component[];
      },
    [hasValidVariant, variantResponse],
  );

  const isArmaTuCrepa = variant.name.toLowerCase().includes("arma tu crepa");

  const MAX_VARIANTS_ARMA = useMemo(() => {
    const counts = Object.keys(armaVariantsMap).map(Number);
    return counts.length > 0 ? Math.max(...counts) : 3;
  }, [armaVariantsMap]);

  const ingredientOptions = useMemo(
    () => (ingredientsResponse?.status === 200 ? ingredientsResponse.data : []),
    [ingredientsResponse],
  );

  const categorizeIngredient = useCallback((name: string) => {
    const n = name.toLowerCase();
    if (
      n.includes("nutella") ||
      n.includes("philadelphia") ||
      n.includes("mermelada") ||
      n.includes("cajeta") ||
      n.includes("lechera") ||
      n.includes("mantequilla") ||
      n.includes("crema") ||
      n.includes("untable")
    )
      return "untables";
    if (
      n.includes("fresa") ||
      n.includes("platano") ||
      n.includes("kiwi") ||
      n.includes("mango") ||
      n.includes("fruta") ||
      n.includes("zarzamora") ||
      n.includes("frutos")
    )
      return "fruta";
    return "toppings";
  }, []);

  const untablesOptions = useMemo(
    () =>
      ingredientOptions.filter(
        (i) => categorizeIngredient(i.name) === "untables",
      ),
    [ingredientOptions, categorizeIngredient],
  );
  const frutaOptions = useMemo(
    () =>
      ingredientOptions.filter((i) => categorizeIngredient(i.name) === "fruta"),
    [ingredientOptions, categorizeIngredient],
  );
  const toppingsOptions = useMemo(
    () =>
      ingredientOptions.filter(
        (i) => categorizeIngredient(i.name) === "toppings",
      ),
    [ingredientOptions, categorizeIngredient],
  );

  const filteredIngredients = useMemo(() => {
    const query = normalizeText(ingredientSearch);
    return ingredientOptions.filter((ingredient) => {
      const alreadyAdded = addedExtras.some(
        (extra) => extra.productId === ingredient.id,
      );
      if (alreadyAdded) return false;
      if (!query) return true;
      return normalizeText(ingredient.name).includes(query);
    });
  }, [ingredientOptions, ingredientSearch, addedExtras]);

  const activeComponents = variant.components.filter(
    (component) => !removedComponents.has(component.id),
  );

  const basePriceCents = useMemo(() => {
    // Try to find the price of the target variant in the list of all variants
    if (allVariantsResponse?.status === 200) {
      const targetVariant = allVariantsResponse.data.variants?.find(
        (v) => v.id === targetVariantId,
      );
      if (targetVariant) {
        return Number.parseInt(targetVariant.price ?? "0", 10);
      }
    }
    // Fallback to the current variant's price
    const val = Number.parseInt(variant.price, 10);
    return Number.isFinite(val) ? val : 0;
  }, [variant.price, allVariantsResponse, targetVariantId]);

  const armaTuCrepaTotalCents = 0;

  const extrasTotalCents = useMemo(
    () =>
      addedExtras.reduce(
        (sum, extra) => sum + extra.unitPriceCents * extra.quantity,
        0,
      ),
    [addedExtras],
  );

  const totalCents = basePriceCents + extrasTotalCents + armaTuCrepaTotalCents;

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

  const deleteExtra = (productId: string) => {
    setAddedExtras((prev) =>
      prev.filter((extra) => extra.productId !== productId),
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
            unitPriceCents: option ? Number(option.price) : 0,
            quantity: modifier.delta,
          };
        });

      setRemovedComponents(nextRemoved);
      setAddedExtras(nextExtras);

      const nextArma: typeof selectedArma = {
        untables: [],
        fruta: [],
        toppings: [],
      };

      const armaModifiers = editingItem.modifiers.filter(
        (m) =>
          m.delta > 0 &&
          !nextExtras.some((e) => e.productId === m.id) &&
          !variant.components.some((c) => c.productId === m.id),
      );

      for (const mod of armaModifiers) {
        const option = ingredientOptions.find((o) => o.id === mod.id);
        if (!option) continue;
        const cat = categorizeIngredient(option.name);
        if (cat === "untables") nextArma.untables.push(mod.id);
        else if (cat === "fruta") nextArma.fruta.push(mod.id);
        else if (cat === "toppings") nextArma.toppings.push(mod.id);
      }

      setSelectedArma(nextArma);

      // Parse baseType from notes if present
      if (editingItem.itemNotes.startsWith("Base: Waffle")) {
        setBaseType("Waffle");
        setNotes(editingItem.itemNotes.replace(/^Base: Waffle\s*\|\s*/, ""));
      } else if (editingItem.itemNotes.startsWith("Base: Crepa")) {
        setBaseType("Crepa");
        setNotes(editingItem.itemNotes.replace(/^Base: Crepa\s*\|\s*/, ""));
      } else {
        setNotes(editingItem.itemNotes);
      }

      setDraftKey(nextKey);
      return;
    }

    const nextKey = `new:${variant.id}`;
    if (draftKey === nextKey) return;

    setRemovedComponents(new Set());
    setAddedExtras([]);
    setSelectedArma({ untables: [], fruta: [], toppings: [] });
    setNotes("");
    setDraftKey(nextKey);
  }, [
    categorizeIngredient,
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

    const armaModifiers = [
      ...selectedArma.untables,
      ...selectedArma.fruta,
      ...selectedArma.toppings,
    ].map((id) => ({
      id,
      delta: 1,
      build_your_own: true,
    }));

    const finalNotes = isArmaTuCrepa
      ? `Base: ${baseType}${notes.trim() ? ` | ${notes.trim()}` : ""}`
      : notes.trim();

    const payload = {
      variantId: targetVariantId,
      itemNotes: finalNotes,
      modifiers: [...removedModifiers, ...extraModifiers, ...armaModifiers],
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

  const handleAddArma = (cat: keyof typeof selectedArma, id: string) => {
    // We allow adding more than MAX_TOTAL_ARMA if there are higher variants available
    // or if we just want to treat them as extras later (though here they are in the Arma section)
    // For now, let's allow up to the maximum variant found in the system
    if (totalArmaSelected >= MAX_VARIANTS_ARMA) return;
    setSelectedArma((prev) => ({
      ...prev,
      [cat]: [...prev[cat], id],
    }));
  };

  const handleRemoveArma = (cat: keyof typeof selectedArma, id: string) => {
    setSelectedArma((prev) => ({
      ...prev,
      [cat]: prev[cat].filter((itemId) => itemId !== id),
    }));
  };

  if (variantLoading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <p className="text-sm text-text-main/40">Cargando...</p>
      </div>
    );
  }

  if (!hasValidVariant) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <p className="text-sm text-red-400">Error al cargar el producto.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background-light via-background-light to-pink-soft/10 pb-64 sm:pb-56">
      <div className="max-w-3xl mx-auto px-4 pt-4 pb-8 flex flex-col gap-5 md:gap-6">
        {/* Header Card */}
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
          </div>
        </div>

        {isArmaTuCrepa && (
          <>
            {/* Base Type Selector */}
            <section className="rounded-3xl border border-pink-soft/35 bg-card-light px-4 py-4 sm:px-5 sm:py-5 shadow-sm flex flex-col gap-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-main/35 m-0">
                Elige tu Base
              </p>
              <div className="grid grid-cols-2 gap-3">
                {(["Crepa", "Waffle"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setBaseType(type)}
                    className={`relative py-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                      baseType === type
                        ? "border-secondary bg-secondary/5 shadow-sm"
                        : "border-pink-soft/20 bg-background-light hover:bg-secondary/5"
                    }`}
                  >
                    <span
                      className={`font-bold text-sm ${
                        baseType === type
                          ? "text-secondary"
                          : "text-text-main/60"
                      }`}
                    >
                      {type}
                    </span>
                    {baseType === type && (
                      <div className="absolute top-2 right-2">
                        <div className="rounded-full bg-secondary p-0.5">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* Arma tu Crepa Section */}
            <section className="rounded-3xl border border-pink-soft/35 bg-card-light px-4 py-4 sm:px-5 sm:py-5 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-main/35 m-0">
                  Arma tu {baseType}
                </p>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    totalArmaSelected >= MAX_VARIANTS_ARMA
                      ? "bg-red-100 text-red-500"
                      : "bg-secondary/20 text-secondary"
                  }`}
                >
                  {totalArmaSelected} / {MAX_VARIANTS_ARMA} seleccionados
                </span>
              </div>

              <div className="flex flex-col gap-6">
                <ArmaCategorySelector
                  label="Untables"
                  options={untablesOptions}
                  selectedIds={selectedArma.untables}
                  onAdd={(id) => handleAddArma("untables", id)}
                  onRemove={(id) => handleRemoveArma("untables", id)}
                  totalSelected={totalArmaSelected}
                  maxLimit={MAX_VARIANTS_ARMA}
                />
                <ArmaCategorySelector
                  label="Fruta"
                  options={frutaOptions}
                  selectedIds={selectedArma.fruta}
                  onAdd={(id) => handleAddArma("fruta", id)}
                  onRemove={(id) => handleRemoveArma("fruta", id)}
                  totalSelected={totalArmaSelected}
                  maxLimit={MAX_VARIANTS_ARMA}
                />
                <ArmaCategorySelector
                  label="Toppings"
                  options={toppingsOptions}
                  selectedIds={selectedArma.toppings}
                  onAdd={(id) => handleAddArma("toppings", id)}
                  onRemove={(id) => handleRemoveArma("toppings", id)}
                  totalSelected={totalArmaSelected}
                  maxLimit={MAX_VARIANTS_ARMA}
                />
              </div>
            </section>
          </>
        )}

        {/* Base Ingredients */}
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
                  className={`rounded-2xl border px-3 py-3 transition-colors ${
                    isRemoved
                      ? "border-red-200/70 bg-red-50/45"
                      : "border-pink-soft/30 bg-background-light"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p
                        className={`text-sm m-0 ${
                          isRemoved
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
                    {component.isRemovable && (
                      <button
                        type="button"
                        onClick={() => toggleComponent(component)}
                        className={`rounded-xl px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-all cursor-pointer ${
                          isRemoved
                            ? "border border-pink-soft/40 text-text-main/60 bg-background-light"
                            : "border border-red-200 text-red-500 bg-red-50 hover:bg-red-100"
                        }`}
                      >
                        {isRemoved ? "Reactivar" : "Quitar"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Extra Ingredients */}
        <section className="rounded-3xl border border-pink-soft/35 bg-card-light px-4 py-4 sm:px-5 sm:py-5 shadow-sm flex flex-col gap-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-main/35 m-0">
            Agregar ingredientes extras
          </p>
          <div className="relative">
            <div className="flex items-center gap-2 rounded-xl border border-pink-soft/30 bg-background-light px-3 py-2.5">
              <Search className="w-4 h-4 text-text-main/30" />
              <input
                type="text"
                value={ingredientSearch}
                onChange={(e) => {
                  setIngredientSearch(e.target.value);
                  setShowIngredientDropdown(true);
                }}
                onFocus={() => setShowIngredientDropdown(true)}
                onBlur={() =>
                  setTimeout(() => setShowIngredientDropdown(false), 200)
                }
                placeholder="Buscar ingrediente extra..."
                className="w-full bg-transparent text-sm text-text-main placeholder:text-text-main/30 focus:outline-none"
              />
            </div>

            {showIngredientDropdown && filteredIngredients.length > 0 && (
              <div className="absolute z-20 left-0 right-0 mt-1 max-h-56 overflow-auto rounded-xl border border-pink-soft/30 bg-card-light shadow-lg">
                {filteredIngredients.map((ingredient) => (
                  <button
                    key={ingredient.id}
                    type="button"
                    onMouseDown={() => addExtra(ingredient)}
                    className="w-full text-left px-3 py-2.5 border-b border-pink-soft/10 last:border-b-0 hover:bg-pink-soft/10 transition-colors"
                  >
                    <span className="block text-sm text-text-main">
                      {ingredient.name}
                    </span>
                    <span className="block text-[11px] text-text-main/35">
                      +${formatCentsToDisplay(ingredient.price)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

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
                        ${formatCentsToDisplay(extra.unitPriceCents)} c/u
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteExtra(extra.productId)}
                      className="text-text-main/25 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => decreaseExtra(extra.productId)}
                      className="w-7 h-7 rounded-lg border border-pink-soft/30 flex items-center justify-center text-text-main/55 hover:text-text-main transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-semibold text-text-main min-w-8 text-center">
                      {extra.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => increaseExtra(extra.productId)}
                      className="w-7 h-7 rounded-lg border border-pink-soft/30 flex items-center justify-center text-text-main/55 hover:text-text-main transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Additional Notes */}
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
            onChange={(e) => setNotes(e.target.value)}
            placeholder="¿Alguna alergia o petición especial?"
            rows={3}
            className="w-full bg-background-light border border-pink-soft/30 rounded-xl px-4 py-3 text-sm text-text-main placeholder:text-text-main/25 focus:outline-none focus:border-pink-soft/60 transition-colors resize-none"
          />
        </section>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed inset-x-0 bottom-0 z-60 border-t border-pink-soft/30 bg-card-light/95 shadow-[0_-8px_24px_rgba(0,0,0,0.12)] backdrop-blur-sm px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-text-main/50 m-0">
              {activeComponents.length} ingrediente
              {activeComponents.length !== 1 ? "s" : ""}
            </p>
            <p className="text-base font-semibold text-text-main m-0 mt-0.5">
              Total: ${formatCentsToDisplay(totalCents)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full sm:w-auto bg-charcoal text-white rounded-xl px-5 sm:px-6 py-4 text-base sm:text-sm font-bold uppercase tracking-wide hover:bg-charcoal/90 transition-all active:scale-[0.99]"
          >
            {isEditing ? "Guardar cambios" : "Añadir al carrito"} · $
            {formatCentsToDisplay(totalCents)}
          </button>
        </div>
      </div>

      {/* Success Modal */}
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
                className="w-full rounded-xl border border-pink-soft/40 px-4 py-3 text-sm font-bold uppercase tracking-wide text-text-main bg-background-light hover:bg-pink-soft/10 transition-colors"
              >
                Seguir comprando
              </button>
              <button
                type="button"
                onClick={() => navigate({ to: "/cart" })}
                className="w-full rounded-xl bg-charcoal px-4 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-charcoal/90 transition-colors"
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
