import type { Category } from "@/features/products/components/category-picker";

export function findCategory(tree: Category[], id: string): Category | null {
  for (const node of tree) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findCategory(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function findRootCategory(
  tree: Category[],
  id: string,
): Category | null {
  for (const node of tree) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findCategory(node.children, id);
      if (found) return node;
    }
  }
  return null;
}

export function collectLeaves(node: Category): Category[] {
  if (!node.children || node.children.length === 0) return [node];
  return node.children.flatMap(collectLeaves);
}

export function getIngredientGroupsForCategory(
  tree: Category[],
  categoryId: string,
): Category[] {
  const ingredientRoot = tree.find(
    (n) => n.name.toLowerCase() === "ingredient",
  );
  if (!ingredientRoot || !ingredientRoot.children) return [];

  const variantRoot = findRootCategory(tree, categoryId);
  if (!variantRoot) return [];

  const variantRootName = variantRoot.name.toLowerCase();

  const matchingGroup = ingredientRoot.children.find(
    (group) => group.name.toLowerCase() === variantRootName,
  );

  if (!matchingGroup || !matchingGroup.children) return [];
  return matchingGroup.children;
}
