import type { Category } from "@/features/products/components/category-picker";

interface IngredientItem {
  id: string;
  name: string;
  image?: string;
  categoryId: string;
}

interface IngredientGroup {
  path: string[];
  items: IngredientItem[];
}

export interface IngredientOption {
  id: string;
  productName: string;
  categoryName: string;
  image?: string;
}

function dedupeById<T extends { id: string }>(items: T[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

export function getBranchKey(name: string) {
  const normalized = normalizeText(name);
  if (normalized.startsWith("dulc")) return "dulce";
  if (normalized.startsWith("salad")) return "salado";
  return normalized;
}

export function normalizeCategories(
  payload: Category[] | { categories?: Category[] } | null | undefined,
): Category[] {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.categories)) return payload.categories;
  return [];
}

export function findCategoryPathById(
  tree: Category[],
  id: string,
  currentPath: Category[] = [],
): Category[] {
  for (const node of tree) {
    const nextPath = [...currentPath, node];
    if (node.id === id) return nextPath;
    if (node.children?.length) {
      const found = findCategoryPathById(node.children, id, nextPath);
      if (found.length) return found;
    }
  }
  return [];
}

export function pathIncludesBranch(path: string[], branchKey: string) {
  return path.some((segment) => getBranchKey(segment) === branchKey);
}

export function getVisibleIngredientOptions(
  groups: IngredientGroup[],
  variantPath: string[],
  rootCategoryName: string,
): IngredientOption[] {
  const rootKey = getBranchKey(rootCategoryName);
  const selectedBranchKey = variantPath
    .map((step) => getBranchKey(step))
    .find((step) => step === "dulce" || step === "salado");

  const filteredGroups =
    rootKey === "crepa" && selectedBranchKey
      ? groups.filter((group) =>
          pathIncludesBranch(group.path, selectedBranchKey),
        )
      : groups;

  return dedupeById(
    filteredGroups.flatMap((group) => {
      const categoryName = group.path.at(-1) ?? "Ingrediente";
      return group.items.map((item) => ({
        id: item.id,
        productName: item.name,
        categoryName,
        image: item.image,
      }));
    }),
  );
}
