import { CategoryButton } from "@/components/ui/category-button";

interface CategoryFiltersProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryFilters({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryFiltersProps) {
  return (
    <div className="relative mb-14 bg-white rounded-2xl p-4 shadow-md border border-pink-soft/30">
      <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide snap-x items-center lg:justify-center">
        {categories.map((cat) => (
          <CategoryButton
            key={cat}
            label={cat}
            isActive={activeCategory === cat}
            onClick={() => onCategoryChange(cat)}
          />
        ))}
      </div>
    </div>
  );
}
