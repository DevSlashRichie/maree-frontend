import { CategoryButton } from "@/features/menu/components/category-button";

interface CategoryItem {
  id: string;
  name: string;
}

interface CategoryFiltersProps {
  categories: CategoryItem[];
  activeCategory: string;
  onCategoryChange: (id: string) => void;
}

export function CategoryFilters({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryFiltersProps) {
  return (
    <div className="relative">
      <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide snap-x items-center lg:justify-center">
        {categories.map((cat) => (
          <CategoryButton
            key={cat.id}
            label={cat.name}
            isActive={activeCategory === cat.id}
            onClick={() => onCategoryChange(cat.id)}
          />
        ))}
      </div>
    </div>
  );
}
