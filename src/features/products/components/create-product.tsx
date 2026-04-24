import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle,
  CheckCircle2,
  ImagePlus,
  Plus,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  useGetV1ProductsIngredients,
  usePostV1ProductsImage,
  usePostV1ProductsProductVariant,
  usePutV1ProductsProductVariantId,
} from "@/lib/api"; // ORVAL generated hooks
import { convertToCents, formatCentsToDisplay, formatPrice } from "@/lib/money";
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
    productId: string;
    name: string;
    productName?: string;
    quantity: number;
    isRemovable: boolean;
  }>;
};

interface ProductFormProps {
  initialData?: ProductInitialData;
}

function isIngredientCategoryName(name: string) {
  const normalized = name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
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

function collectIngredientOptionsFromGroups(
  groups: IngredientGroup[],
): IngredientOption[] {
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
  const navigate = useNavigate();

  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [isActive, setIsActive] = useState(
    initialData ? initialData.status === "active" : true,
  );
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? "");
  // Price is stored in cents internally
  const [priceCents, setPriceCents] = useState(
    initialData ? Number(initialData.price) : 0,
  );

  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image ?? null,
  );

  const [selectedIngredients, setSelectedIngredients] = useState<
    SelectedIngredient[]
  >(
    initialData?.components.map((c) => ({
      id: c.productId,
      productName: c.name,
      categoryName: c.productName ?? "Ingrediente",
      quantity: c.quantity,
      isRemovable: c.isRemovable,
    })) ?? [],
  );

  const [selectedCategoryPath, setSelectedCategoryPath] = useState<Category[]>(
    [],
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [showIngredientDropdown, setShowIngredientDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [_formError, setFormError] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const { data: ingredientsResponse } = useGetV1ProductsIngredients();
  const { trigger: uploadImage } = usePostV1ProductsImage();
  const { trigger: createProduct } = usePostV1ProductsProductVariant();
  const { trigger: updateProduct } = usePutV1ProductsProductVariantId(
    initialData?.id ?? "",
  );

  const ingredientOptions = useMemo(() => {
    const groups =
      ingredientsResponse?.status === 200 ? ingredientsResponse.data : [];
    return collectIngredientOptionsFromGroups(groups);
  }, [ingredientsResponse]);

  const isIngredient = selectedCategoryPath.some((step) =>
    isIngredientCategoryName(step.name),
  );

  const _ingredientIdSet = useMemo(
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

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits
    if (/^\d*$/.test(value)) {
      setPriceCents(value ? parseInt(value, 10) : 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!categoryId) return setFormError("Selecciona una categoría.");

    setIsSubmitting(true);
    try {
      let finalImageUrl = imagePreview ?? "";
      if (imageFile) {
        const imageRes = await uploadImage({ image: imageFile });
        if (imageRes.status === 201 && "url" in imageRes.data) {
          finalImageUrl = imageRes.data.url;
        }
      }

      const body = {
        name,
        description,
        status: isActive ? "active" : "inactive",
        categoryId,
        price: priceCents * 100,
        imageUrl: finalImageUrl,
        ingredients: selectedIngredients.map((i) => ({
          id: i.id,
          quantity: i.quantity,
          isRemovable: i.isRemovable,
        })),
      };

      if (isEditing) {
        const response = await updateProduct(body);
        if (response.status === 200) setSubmitted(true);
      } else {
        const response = await createProduct(body);
        if (response.status === 201) setSubmitted(true);
      }
    } catch {
      setFormError("Error al procesar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted && isEditing) {
    return (
      <div className="min-h-screen bg-linear-to-b from-background-light via-background-light to-pink-soft/10 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4 flex flex-col items-center gap-6 text-center">
          <CheckCircle className="w-14 h-14 text-green-500" />
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-3xl font-normal text-text-main m-0">
              Producto actualizado
            </h2>
            <p className="text-sm text-text-main/50 m-0">
              Los cambios se guardaron correctamente.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate({ to: "/admin/inventory/products" })}
            className="flex items-center gap-2 bg-charcoal text-white rounded-xl px-6 py-3 text-sm font-medium hover:opacity-90 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a productos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background-light via-background-light to-pink-soft/10">
      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-7">
        <button
          type="button"
          onClick={() => navigate({ to: "/admin/inventory/products" })}
          className="flex items-center gap-1.5 text-sm text-text-main/50 hover:text-text-main transition-colors w-fit cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>

        <div className="rounded-3xl border border-pink-soft/35 bg-card-light px-7 py-7 shadow-sm">
          <h1 className="font-display text-4xl font-normal text-text-main m-0">
            {isEditing ? "Editar Producto" : "Nuevo Producto"}
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start"
        >
          <div className="bg-card-light rounded-3xl border border-pink-soft/40 p-6 flex flex-col gap-6 shadow-sm">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-text-main">Categoría</p>
              <CategoryPicker
                value={categoryId}
                onChange={setCategoryId}
                onPathChange={setSelectedCategoryPath}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="name"
                className="text-sm font-medium text-text-main"
              >
                Nombre
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-background-light border border-pink-soft/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-soft/60"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="desc"
                className="text-sm font-medium text-text-main"
              >
                Descripción
              </label>
              <textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-background-light border border-pink-soft/30 rounded-xl px-4 py-3 text-sm focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-pink-soft/25 bg-background-light px-4 py-3">
              <div>
                <p className="text-sm font-medium m-0 text-text-main">Activo</p>
                <p className="text-xs text-text-main/40 m-0">
                  Visible en el menú público
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative w-11 h-6 rounded-full transition-colors ${isActive ? "bg-green-500" : "bg-red-300"}`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isActive ? "left-6" : "left-1"}`}
                />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="price"
                className="text-sm font-medium text-text-main"
              >
                Precio
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-text-main/40">
                  $
                </span>
                <input
                  id="price"
                  type="text"
                  value={priceCents}
                  onChange={handlePriceChange}
                  placeholder="80"
                  required
                  className="w-full bg-background-light border border-pink-soft/30 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="product-image"
                className="text-sm font-medium text-text-main"
              >
                Imagen
              </label>
              <input
                id="product-image"
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full border border-dashed border-pink-soft/40 rounded-2xl py-6 flex flex-col items-center gap-2 hover:bg-pink-soft/5 transition-all cursor-pointer"
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="w-16 h-16 rounded-xl object-cover shadow-sm"
                  />
                ) : (
                  <>
                    <ImagePlus className="w-5 h-5 text-text-main/20" />
                    <span className="text-xs text-text-main/30">
                      Subir imagen
                    </span>
                  </>
                )}
              </button>
            </div>

            {categoryId && !isIngredient && (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-text-main">
                  Ingredientes
                </p>
                {selectedIngredients.length > 0 && (
                  <div className="bg-background-light rounded-xl border border-pink-soft/20 px-3">
                    {selectedIngredients.map((ing) => (
                      <IngredientRow
                        key={ing.id}
                        ingredient={ing}
                        onQuantityChange={(id, q) =>
                          setSelectedIngredients((prev) =>
                            prev.map((i) =>
                              i.id === id ? { ...i, quantity: q } : i,
                            ),
                          )
                        }
                        onRemovableToggle={(id) =>
                          setSelectedIngredients((prev) =>
                            prev.map((i) =>
                              i.id === id
                                ? { ...i, isRemovable: !i.isRemovable }
                                : i,
                            ),
                          )
                        }
                        onRemove={(id) =>
                          setSelectedIngredients((prev) =>
                            prev.filter((i) => i.id !== id),
                          )
                        }
                      />
                    ))}
                  </div>
                )}
                <div className="relative">
                  <div className="flex items-center gap-2 bg-background-light border border-pink-soft/30 rounded-xl px-4 py-3">
                    <Plus className="w-3.5 h-3.5 text-text-main/30" />
                    <input
                      type="text"
                      value={ingredientSearch}
                      onChange={(e) => {
                        setIngredientSearch(e.target.value);
                        setShowIngredientDropdown(true);
                      }}
                      onFocus={() => setShowIngredientDropdown(true)}
                      onBlur={() =>
                        setTimeout(() => setShowIngredientDropdown(false), 150)
                      }
                      placeholder="Añadir ingrediente..."
                      className="flex-1 bg-transparent text-sm focus:outline-none"
                    />
                  </div>
                  {showIngredientDropdown && filteredIngredients.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-card-light border border-pink-soft/30 rounded-xl overflow-hidden z-10 shadow-xl">
                      {filteredIngredients.map((ing) => (
                        <button
                          key={ing.id}
                          type="button"
                          onMouseDown={() => addIngredient(ing)}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-pink-soft/10 transition-colors cursor-pointer"
                        >
                          <span className="block font-medium text-text-main">
                            {ing.productName}
                          </span>
                          <span className="block text-[11px] text-text-main/35">
                            {ing.categoryName}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="bg-card-light rounded-3xl border border-pink-soft/40 p-6 shadow-sm lg:sticky lg:top-6 flex flex-col gap-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-main/40 m-0">
              Resumen
            </p>
            <div className="text-sm text-text-main/60 flex flex-col gap-3 mt-2">
              <div className="flex justify-between items-center">
                <span>Estado</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"}`}
                >
                  {isActive ? "ACTIVO" : "INACTIVO"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Ingredientes</span>
                <span className="font-bold text-text-main">
                  {selectedIngredients.length}
                </span>
              </div>
              <div className="flex justify-between border-t border-pink-soft/10 pt-3 text-base">
                <span className="font-medium text-text-main">Total</span>
                <span className="font-bold text-text-main">
                  {priceCents || "0"}
                </span>
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !categoryId}
              className="w-full bg-charcoal text-white rounded-xl py-4 text-[11px] font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer"
            >
              {isSubmitting
                ? "Procesando..."
                : isEditing
                  ? "Actualizar"
                  : "Crear Producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type CreateProductPayload = {
  name: string;
  description: string;
  status: "active" | "inactive";
  categoryId: string;
  price: number;
  imageUrl: string;
  ingredients: Array<{ id: string; quantity: number; isRemovable: boolean }>;
};

export function CreateProduct() {
  const [selectedCategoryPath, setSelectedCategoryPath] = useState<Category[]>(
    [],
  );
  const { data: ingredientsResponse, isLoading: ingredientsLoading } =
    useGetV1ProductsIngredients();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<
    SelectedIngredient[]
  >([]);
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [showIngredientDropdown, setShowIngredientDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [lastPayload, setLastPayload] = useState<CreateProductPayload | null>(
    null,
  );
  const fileRef = useRef<HTMLInputElement>(null);
  const { trigger: uploadImage } = usePostV1ProductsImage();
  const { trigger: createProductVariant } = usePostV1ProductsProductVariant();

  const ingredientOptions = useMemo(() => {
    const groups =
      ingredientsResponse?.status === 200 ? ingredientsResponse.data : [];
    return collectIngredientOptionsFromGroups(groups);
  }, [ingredientsResponse]);

  const isIngredient = selectedCategoryPath.some((step) =>
    isIngredientCategoryName(step.name),
  );

  const ingredientIdSet = useMemo(
    () => new Set(ingredientOptions.map((i) => i.id)),
    [ingredientOptions],
  );

  useEffect(() => {
    if (isIngredient) {
      setSelectedIngredients([]);
      setIngredientSearch("");
      setShowIngredientDropdown(false);
      return;
    }
    setSelectedIngredients((prev) =>
      prev.filter((i) => ingredientIdSet.has(i.id)),
    );
  }, [ingredientIdSet, isIngredient]);

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
    setFormError(null);
    if (!categoryId) {
      setFormError("Selecciona una categoría final antes de guardar.");
      return;
    }
    const parsedPrice = parseFloat(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setFormError("Ingresa un precio válido mayor que 0.");
      return;
    }
    if (!imageFile) {
      setFormError("Sube una imagen para continuar.");
      return;
    }

    setIsSubmitting(true);
    try {
      const imageRes = await uploadImage({ image: imageFile });
      if (imageRes.status !== 201 || !("url" in imageRes.data)) {
        setFormError("No se pudo subir la imagen. Intenta nuevamente.");
        return;
      }
      const payload: CreateProductPayload = {
        name,
        description,
        status: isActive ? "active" : "inactive",
        categoryId,
        price: convertToCents(parsedPrice),
        imageUrl: imageRes.data.url,
        ingredients: selectedIngredients.map(
          ({ id, quantity, isRemovable }) => ({ id, quantity, isRemovable }),
        ),
      };
      const res = await createProductVariant(payload);
      if (res.status !== 201) {
        setFormError("No se pudo guardar el producto. Intenta nuevamente.");
        return;
      }
      setLastPayload(payload);
      setSubmitted(true);
    } catch {
      setFormError("No se pudo guardar. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-linear-to-b from-background-light via-background-light to-pink-soft/10 flex items-center justify-center px-4">
        <div className="w-full max-w-3xl rounded-3xl border border-pink-soft/40 bg-card-light p-6 md:p-8 shadow-sm">
          <div className="text-center flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full bg-green-100 border border-green-200 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <p className="font-display text-3xl text-text-main">
              Producto creado
            </p>
            <p className="text-sm text-text-main/45">
              El producto se ha guardado exitosamente y ya está disponible.
            </p>
          </div>
          {lastPayload && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-pink-soft/25 bg-background-light p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-main/35 m-0">
                  Producto
                </p>
                <p className="mt-2 text-lg font-semibold text-text-main m-0">
                  {lastPayload.name}
                </p>
                {lastPayload.description && (
                  <p className="mt-1 text-sm text-text-main/60 m-0 whitespace-pre-wrap">
                    {lastPayload.description}
                  </p>
                )}
                <p className="mt-3 text-sm text-text-main/65 m-0">
                  Precio: {formatPrice(lastPayload.price)}
                </p>
              </div>
              <div className="rounded-2xl border border-pink-soft/25 bg-background-light p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-main/35 m-0">
                  Imagen
                </p>
                <p className="mt-2 text-sm text-text-main/65 break-all m-0">
                  {lastPayload.imageUrl}
                </p>
              </div>
              <div className="md:col-span-2 rounded-2xl border border-pink-soft/25 bg-background-light p-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-main/35 m-0">
                    Ingredientes enviados
                  </p>
                  <span className="text-xs font-semibold text-text-main/60">
                    {lastPayload.ingredients.length}
                  </span>
                </div>
                {lastPayload.ingredients.length === 0 ? (
                  <p className="mt-2 text-sm text-text-main/45 m-0">
                    Este producto no incluye ingredientes adicionales.
                  </p>
                ) : (
                  <div className="mt-3 flex flex-col gap-2">
                    {lastPayload.ingredients.map((ing) => {
                      const selected = selectedIngredients.find(
                        (item) => item.id === ing.id,
                      );
                      return (
                        <div
                          key={ing.id}
                          className="flex items-center justify-between rounded-xl border border-pink-soft/20 bg-card-light px-3 py-2"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-text-main m-0 truncate">
                              {selected?.productName ?? ing.id}
                            </p>
                            <p className="text-[11px] text-text-main/35 m-0 truncate">
                              {selected?.categoryName ?? "Sin categoría"}
                            </p>
                          </div>
                          <span className="text-xs text-text-main/60 font-mono">
                            x{ing.quantity}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setFormError(null);
              setName("");
              setPrice("");
              setDescription("");
              setCategoryId("");
              setIsActive(true);
              setImageFile(null);
              setSelectedIngredients([]);
              setImagePreview(null);
              setSelectedCategoryPath([]);
            }}
            className="mt-5 w-full rounded-xl border border-pink-soft/40 py-3 text-[11px] font-bold uppercase tracking-widest text-text-main/70 hover:bg-pink-soft/10 transition-colors cursor-pointer"
          >
            Crear otro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background-light via-background-light to-pink-soft/10">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-10 flex flex-col gap-7">
        <button
          type="button"
          onClick={() => history.back()}
          className="flex items-center gap-1.5 text-sm text-text-main/50 hover:text-text-main transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
        <div className="rounded-3xl border border-pink-soft/35 bg-card-light px-5 py-6 md:px-7 md:py-7 shadow-sm">
          <h1 className="font-display text-4xl font-normal text-text-main m-0">
            Nuevo Producto
          </h1>
        </div>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start"
        >
          <div className="bg-card-light rounded-3xl border border-pink-soft/40 px-5 py-5 md:px-6 md:py-6 flex flex-col gap-6 shadow-sm">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-text-main">Categoría</p>
              <CategoryPicker
                value={categoryId}
                onChange={setCategoryId}
                onPathChange={setSelectedCategoryPath}
              />
              {!categoryId && (
                <p className="text-[11px] text-text-main/30 m-0">
                  Selecciona hasta llegar a una categoría final.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="cp-name"
                className="text-sm font-medium text-text-main"
              >
                Nombre
              </label>
              <input
                id="cp-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Crepa Personalizada"
                required
                className="w-full bg-background-light border border-pink-soft/30 rounded-xl px-4 py-3 text-sm text-text-main placeholder:text-text-main/25 focus:outline-none focus:border-pink-soft/60 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="cp-desc"
                className="text-sm font-medium text-text-main"
              >
                Descripción
              </label>
              <textarea
                id="cp-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe el producto..."
                rows={3}
                className="w-full bg-background-light border border-pink-soft/30 rounded-xl px-4 py-3 text-sm text-text-main placeholder:text-text-main/25 focus:outline-none focus:border-pink-soft/60 transition-colors resize-y"
              />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-pink-soft/25 bg-background-light px-4 py-3">
              <div>
                <p className="text-sm font-medium text-text-main m-0">Activo</p>
                <p className="text-xs text-text-main/40 m-0">
                  El producto será visible en el menú
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <span
                  className={`text-xs font-medium transition-colors ${isActive ? "text-green-600" : "text-red-400"}`}
                >
                  {isActive ? "Activo" : "Inactivo"}
                </span>
                <button
                  type="button"
                  onClick={() => setIsActive((v) => !v)}
                  role="switch"
                  aria-checked={isActive}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${isActive ? "bg-green-500" : "bg-red-300"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isActive ? "left-6" : "left-1"}`}
                  />
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="cp-price"
                className="text-sm font-medium text-text-main"
              >
                Precio
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-text-main/40 font-display">
                  $
                </span>
                <input
                  id="cp-price"
                  type="text"
                  inputMode="decimal"
                  value={price}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "" || /^\d*\.?\d*$/.test(v)) setPrice(v);
                  }}
                  placeholder="0.00"
                  required
                  className="w-full bg-background-light border border-pink-soft/30 rounded-xl pl-8 pr-4 py-3 text-sm text-text-main placeholder:text-text-main/25 focus:outline-none focus:border-pink-soft/60 transition-colors"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="create-product-image"
                className="text-sm font-medium text-text-main"
              >
                Imagen
              </label>
              <input
                id="create-product-image"
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full border border-dashed border-pink-soft/40 rounded-2xl py-6 flex flex-col items-center gap-2 hover:border-pink-soft/70 hover:bg-pink-soft/5 transition-all cursor-pointer"
              >
                {imagePreview ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                    <span className="text-xs text-text-main/50">
                      Imagen lista para subir
                    </span>
                  </div>
                ) : (
                  <>
                    <ImagePlus className="w-5 h-5 text-text-main/20" />
                    <span className="text-xs text-text-main/30">
                      Haz clic para seleccionar la imagen
                    </span>
                  </>
                )}
              </button>
            </div>
            {categoryId && !isIngredient && (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-text-main">
                  Ingredientes
                </p>
                {selectedIngredients.length > 0 && (
                  <div className="bg-background-light rounded-xl border border-pink-soft/20 px-3">
                    {selectedIngredients.map((ing) => (
                      <IngredientRow
                        key={ing.id}
                        ingredient={ing}
                        onQuantityChange={(id, q) =>
                          setSelectedIngredients((prev) =>
                            prev.map((i) =>
                              i.id === id ? { ...i, quantity: q } : i,
                            ),
                          )
                        }
                        onRemovableToggle={(id) =>
                          setSelectedIngredients((prev) =>
                            prev.map((i) =>
                              i.id === id
                                ? { ...i, isRemovable: !i.isRemovable }
                                : i,
                            ),
                          )
                        }
                        onRemove={(id) =>
                          setSelectedIngredients((prev) =>
                            prev.filter((i) => i.id !== id),
                          )
                        }
                      />
                    ))}
                  </div>
                )}
                {ingredientsLoading ? (
                  <div className="rounded-xl border border-pink-soft/20 bg-background-light px-4 py-3 text-xs text-text-main/35">
                    Cargando ingredientes...
                  </div>
                ) : (
                  <div className="relative">
                    <div className="flex items-center gap-2 w-full bg-background-light border border-pink-soft/30 rounded-xl px-4 py-3">
                      <Plus className="w-3.5 h-3.5 text-text-main/30 shrink-0" />
                      <input
                        type="text"
                        value={ingredientSearch}
                        onChange={(e) => {
                          setIngredientSearch(e.target.value);
                          setShowIngredientDropdown(true);
                        }}
                        onFocus={() => setShowIngredientDropdown(true)}
                        onBlur={() =>
                          setTimeout(
                            () => setShowIngredientDropdown(false),
                            150,
                          )
                        }
                        placeholder="Agregar ingrediente..."
                        className="flex-1 bg-transparent text-sm text-text-main placeholder:text-text-main/25 focus:outline-none"
                      />
                    </div>
                    {showIngredientDropdown &&
                      filteredIngredients.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-card-light border border-pink-soft/30 rounded-xl overflow-hidden z-10">
                          {filteredIngredients.map((ing) => (
                            <button
                              key={ing.id}
                              type="button"
                              onMouseDown={() => addIngredient(ing)}
                              className="w-full text-left px-4 py-2.5 text-sm text-text-main hover:bg-pink-soft/10 transition-colors cursor-pointer"
                            >
                              <span className="block font-medium text-text-main">
                                {ing.productName}
                              </span>
                              <span className="block text-[11px] text-text-main/35">
                                {ing.categoryName}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="bg-card-light rounded-3xl border border-pink-soft/40 px-5 py-5 md:px-6 md:py-6 shadow-sm lg:sticky lg:top-6 flex flex-col gap-4">
            <p className="text-xs font-medium text-text-main/40 m-0">
              Resumen de envío
            </p>
            <div className="text-sm text-text-main/60 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span>Estado</span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"}`}
                >
                  {isActive ? "Activo" : "Inactivo"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Ingredientes</span>
                <span className="font-medium text-text-main">
                  {selectedIngredients.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Precio</span>
                <span className="font-medium text-text-main">
                  {price ? formatCentsToDisplay(convertToCents(price)) : "0.00"}
                </span>
              </div>
            </div>
            {formError && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2 m-0">
                {formError}
              </p>
            )}
            <button
              type="submit"
              disabled={isSubmitting || !categoryId}
              className="w-full bg-charcoal text-white rounded-xl py-3.5 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest hover:bg-charcoal/90 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Guardando..." : "Crear Producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
