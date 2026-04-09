export interface Ingredient {
  id: string;
  name: string;
}

export interface SelectedIngredient {
  id: string;
  productName: string;
  categoryName: string;
  quantity: number;
  isRemovable: boolean;
}

export interface CreateProductPayload {
  name: string;
  status: string;
  categoryId: string;
  type: string;
}

export interface CreateVariantPayload {
  name: string;
  price: string;
  productId: string;
  image?: string;
  ingredients: { id: string; quantity: number; isRemovable: boolean }[];
}

export function useIngredients() {
  const ingredients: Ingredient[] = [
    { id: "ing-1", name: "Fresa" },
    { id: "ing-2", name: "Nutella" },
    { id: "ing-3", name: "Nata" },
    { id: "ing-4", name: "Plátano" },
    { id: "ing-5", name: "Chocolate" },
    { id: "ing-6", name: "Vainilla" },
    { id: "ing-7", name: "Caramelo" },
  ];
  return { ingredients, isLoading: false };
}

export function useCreateProduct() {
  const createProduct = async (payload: CreateProductPayload) => {
    await new Promise((r) => setTimeout(r, 800));
    return {
      id: "mock-product-id",
      ...payload,
      image: null,
      createdAt: new Date().toISOString(),
    };
  };
  return { createProduct, isLoading: false };
}

export function useCreateVariant() {
  const createVariant = async (payload: CreateVariantPayload) => {
    await new Promise((r) => setTimeout(r, 800));
    return {
      id: "mock-variant-id",
      ...payload,
      createdAt: new Date().toISOString(),
    };
  };
  return { createVariant, isLoading: false };
}
