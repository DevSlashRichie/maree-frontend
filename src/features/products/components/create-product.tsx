import { ArrowLeft, CheckCircle2, ImagePlus, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  useGetV1ProductsIngredients,
  usePostV1ProductsImage,
  usePostV1ProductsProductVariant,
} from "@/lib/api";
import { convertToCents, formatCentsToDisplay } from "@/lib/money";
import type { SelectedIngredient } from "../data/mock";
import { type Category, CategoryPicker } from "./category-picker";
import { IngredientRow } from "./ingredient-row";

export type ProductInitialData = {
  id: string;
  name: string;
  description?: string;
  status: "active" | "inactive";
  categoryId: string;
  price: string | number;
  image: string | null;
  components: Array<{
    id: string;
    name: string;
    categoryName?: string;
    quantity: number;
    isRemovable: boolean;
  }>;
};

interface ProductFormProps {
  initialData?: ProductInitialData;
}

function isIngredientCategoryName(name: string) {
  const normalized = name.normalize("NFD").replace(/\p{Diacritic}/gu, "").trim().toLowerCase();
  return normalized === "ingredient" || normalized === "ingrediente";
}

function dedupeById<T extends { id: string }>(items: T[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

type IngredientOption = {
  id: string;
  productName: string;
  categoryName: string;
};

type IngredientGroup = {
  path: string[];
  items: Array<{ id: string; name: string }>;
};

function collectIngredientOptionsFromGroups(groups: IngredientGroup[]): IngredientOption[] {
  return dedupeById(
    groups.flatMap((group) => {
      const categoryName = group.path.at(-1) ?? "Sin categoría";
      return group.items.map((item) => ({
        id: item.id,
        productName: item.name,
        categoryName,
      }));
    }),
  );
}

export function ProductForm({ initialData }: ProductFormProps) {
  const isEditing = !!initialData;

  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [isActive, setIsActive] = useState(initialData ? initialData.status === "active" : true);
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? "");
  const [price, setPrice] = useState(initialData ? (Number(initialData.price) / 100).toString() : "");
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image ?? null);
  
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>(
    initialData?.components.map(c => ({
      id: c.id,
      productName: c.name,
      categoryName: c.categoryName ?? "Ingrediente",
      quantity: c.quantity,
      isRemovable: c.isRemovable
    })) ?? []
  );

  const [selectedCategoryPath, setSelectedCategoryPath] = useState<Category[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [showIngredientDropdown, setShowIngredientDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const { data: ingredientsResponse, isLoading: ingredientsLoading } = useGetV1ProductsIngredients();
  const { trigger: uploadImage } = usePostV1ProductsImage();
  const { trigger: createProduct } = usePostV1ProductsProductVariant();

  const ingredientOptions = useMemo(() => {
    const groups = ingredientsResponse?.status === 200 ? ingredientsResponse.data : [];
    return collectIngredientOptionsFromGroups(groups);
  }, [ingredientsResponse]);

  const isIngredient = selectedCategoryPath.some((step) => isIngredientCategoryName(step.name));

  const ingredientIdSet = useMemo(
    () => new Set(ingredientOptions.map((i) => i.id)),
    [ingredientOptions],
  );

  useEffect(() => {
    if (isIngredient) {
      setSelectedIngredients([]);
      setIngredientSearch("");
      setShowIngredientDropdown(false);
    }
  }, [isIngredient]);

  const filteredIngredients = ingredientOptions.filter(
    (i) =>
      i.productName.toLowerCase().includes(ingredientSearch.toLowerCase()) &&
      !selectedIngredients.find((s) => s.id === i.id),
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const addIngredient = (ingredient: IngredientOption) => {
    setSelectedIngredients((prev) => [
      ...prev,
      {
        id: ingredient.id,
        productName: ingredient.productName,
        categoryName: ingredient.categoryName,
        quantity: 1,
        isRemovable: true,
      },
    ]);
    setIngredientSearch("");
    setShowIngredientDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
       console.log("Modo edición: El endpoint PATCH aún no existe.");
       return;
    }
    
    setFormError(null);
    if (!categoryId) return setFormError("Selecciona una categoría.");
    
    setIsSubmitting(true);
    try {
      let finalImageUrl = "";
      if (imageFile) {
        const imageRes = await uploadImage({ image: imageFile });
        if (imageRes.status === 201 && "url" in imageRes.data) {
          finalImageUrl = imageRes.data.url;
        }
      }

      const response = await createProduct({
        name,
        description,
        status: (isActive ? "active" : "inactive"),
        categoryId,
        price: convertToCents(parseFloat(price)),
        imageUrl: finalImageUrl,
        ingredients: selectedIngredients.map(i => ({ id: i.id, quantity: i.quantity, isRemovable: i.isRemovable }))
      });

      if (response.status === 201) setSubmitted(true);
    } catch {
      setFormError("Error al procesar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-background-light via-background-light to-pink-soft/10">
      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-7">
        <button type="button" onClick={() => window.history.back()} className="flex items-center gap-1.5 text-sm text-text-main/50 hover:text-text-main transition-colors w-fit cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>

        <div className="rounded-3xl border border-pink-soft/35 bg-card-light px-7 py-7 shadow-sm">
          <h1 className="font-display text-4xl font-normal text-text-main m-0">
            {isEditing ? "Editar Producto" : "Nuevo Producto"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">
          <div className="bg-card-light rounded-3xl border border-pink-soft/40 p-6 flex flex-col gap-6 shadow-sm">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-main">Categoría</label>
              <CategoryPicker value={categoryId} onChange={setCategoryId} onPathChange={setSelectedCategoryPath} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-medium text-text-main">Nombre</label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-background-light border border-pink-soft/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-soft/60" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="desc" className="text-sm font-medium text-text-main">Descripción</label>
              <textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full bg-background-light border border-pink-soft/30 rounded-xl px-4 py-3 text-sm focus:outline-none resize-none" />
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-pink-soft/25 bg-background-light px-4 py-3">
              <div>
                <p className="text-sm font-medium m-0 text-text-main">Activo</p>
                <p className="text-xs text-text-main/40 m-0">Visible en el menú público</p>
              </div>
              <button type="button" onClick={() => setIsActive(!isActive)} className={`relative w-11 h-6 rounded-full transition-colors ${isActive ? "bg-green-500" : "bg-red-300"}`}>
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isActive ? "left-6" : "left-1"}`} />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="price" className="text-sm font-medium text-text-main">Precio</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-text-main/40">$</span>
                <input id="price" type="text" value={price} onChange={(e) => /^\d*\.?\d*$/.test(e.target.value) && setPrice(e.target.value)} required className="w-full bg-background-light border border-pink-soft/30 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-main">Imagen</label>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              <button type="button" onClick={() => fileRef.current?.click()} className="w-full border border-dashed border-pink-soft/40 rounded-2xl py-6 flex flex-col items-center gap-2 hover:bg-pink-soft/5 transition-all cursor-pointer">
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" className="w-16 h-16 rounded-xl object-cover shadow-sm" />
                ) : (
                  <>
                    <ImagePlus className="w-5 h-5 text-text-main/20" />
                    <span className="text-xs text-text-main/30">Subir imagen</span>
                  </>
                )}
              </button>
            </div>

            {categoryId && !isIngredient && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-text-main">Ingredientes</label>
                {selectedIngredients.length > 0 && (
                  <div className="bg-background-light rounded-xl border border-pink-soft/20 px-3">
                    {selectedIngredients.map((ing) => (
                      <IngredientRow key={ing.id} ingredient={ing} onQuantityChange={(id, q) => setSelectedIngredients(prev => prev.map(i => i.id === id ? {...i, quantity: q} : i))} onRemovableToggle={(id) => setSelectedIngredients(prev => prev.map(i => i.id === id ? {...i, isRemovable: !i.isRemovable} : i))} onRemove={(id) => setSelectedIngredients(prev => prev.filter(i => i.id !== id))} />
                    ))}
                  </div>
                )}
                <div className="relative">
                  <div className="flex items-center gap-2 bg-background-light border border-pink-soft/30 rounded-xl px-4 py-3">
                    <Plus className="w-3.5 h-3.5 text-text-main/30" />
                    <input type="text" value={ingredientSearch} onChange={(e) => {setIngredientSearch(e.target.value); setShowIngredientDropdown(true);}} onFocus={() => setShowIngredientDropdown(true)} onBlur={() => setTimeout(() => setShowIngredientDropdown(false), 150)} placeholder="Añadir ingrediente..." className="flex-1 bg-transparent text-sm focus:outline-none" />
                  </div>
                  {showIngredientDropdown && filteredIngredients.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-card-light border border-pink-soft/30 rounded-xl overflow-hidden z-10 shadow-xl">
                      {filteredIngredients.map((ing) => (
                        <button key={ing.id} type="button" onMouseDown={() => addIngredient(ing)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-pink-soft/10 transition-colors cursor-pointer">
                          <span className="block font-medium text-text-main">{ing.productName}</span>
                          <span className="block text-[11px] text-text-main/35">{ing.categoryName}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="bg-card-light rounded-3xl border border-pink-soft/40 p-6 shadow-sm lg:sticky lg:top-6 flex flex-col gap-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-main/40 m-0">Resumen</p>
            <div className="text-sm text-text-main/60 flex flex-col gap-3 mt-2">
              <div className="flex justify-between items-center">
                <span>Estado</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"}`}>{isActive ? "ACTIVO" : "INACTIVO"}</span>
              </div>
              <div className="flex justify-between">
                <span>Ingredientes</span>
                <span className="font-bold text-text-main">{selectedIngredients.length}</span>
              </div>
              <div className="flex justify-between border-t border-pink-soft/10 pt-3 text-base">
                <span className="font-medium text-text-main">Total</span>
                <span className="font-bold text-text-main">{price ? formatCentsToDisplay(convertToCents(parseFloat(price))) : "$0.00"}</span>
              </div>
            </div>
            <button type="submit" disabled={isSubmitting || !categoryId} className="w-full bg-charcoal text-white rounded-xl py-4 text-[11px] font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer">
              {isSubmitting ? "Procesando..." : isEditing ? "Actualizar (Pronto)" : "Crear Producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}