import { ChevronRight, Home, X } from "lucide-react";
import { useState } from "react";
import { useGetV1ProductsCategories } from "@/lib/api.ts";

export interface Category {
  id: string;
  name: string;
  children?: Category[];
}

interface CategoryPickerProps {
  value: string;
  onChange: (id: string) => void;
  onRootChange?: (root: Category | null) => void;
  onPathChange?: (path: Category[]) => void;
}

export function CategoryPicker({
  value,
  onChange,
  onRootChange,
  onPathChange,
}: CategoryPickerProps) {
  const [path, setPath] = useState<Category[]>([]);
  const { data: response, isLoading } = useGetV1ProductsCategories();

  if (isLoading)
    return <p className="text-xs text-text-main/40">Cargando categorías...</p>;
  if (!response || response.status !== 200)
    return <p className="text-xs text-red-400">Error al cargar categorías.</p>;

  const categories: Category[] = response.data;
  const currentOptions =
    path.length === 0 ? categories : (path[path.length - 1].children ?? []);
  const isLeaf = (cat: Category) => !cat.children || cat.children.length === 0;

  const handleSelect = (cat: Category) => {
    const nextPath = [...path, cat];
    if (path.length === 0) onRootChange?.(cat);
    onPathChange?.(nextPath);
    if (isLeaf(cat)) {
      onChange(cat.id);
    } else {
      onChange("");
    }
    setPath(nextPath);
  };

  const handleReset = () => {
    setPath([]);
    onChange("");
    onRootChange?.(null);
    onPathChange?.([]);
  };

  const handleBreadcrumb = (index: number) => {
    const newPath = path.slice(0, index + 1);
    setPath(newPath);
    onPathChange?.(newPath);
    const last = newPath[newPath.length - 1];
    if (isLeaf(last)) {
      onChange(last.id);
    } else {
      onChange("");
    }
  };

  const handleBack = () => {
    const newPath = path.slice(0, -1);
    setPath(newPath);
    onChange("");
    onPathChange?.(newPath);
    if (newPath.length === 0) onRootChange?.(null);
  };

  const selectedLeaf =
    value && path.length > 0 && isLeaf(path[path.length - 1])
      ? path[path.length - 1]
      : null;

  return (
    <div className="flex flex-col gap-3">
      {/* Breadcrumb nav */}
      <div className="flex items-center gap-1 flex-wrap">
        <button
          type="button"
          onClick={handleReset}
          className={`flex items-center gap-1 text-xs px-1 py-0.5 rounded transition-colors ${
            path.length === 0
              ? "text-secondary font-semibold cursor-default"
              : "text-text-main/40 hover:text-text-main cursor-pointer"
          }`}
        >
          <Home className="w-3 h-3" />
          Todas
        </button>
        {path.map((step, i) => (
          <span key={step.id} className="flex items-center gap-1">
            <ChevronRight className="w-3 h-3 text-text-main/20" />
            <button
              type="button"
              onClick={() => handleBreadcrumb(i)}
              className={`text-xs px-1 py-0.5 rounded transition-colors ${
                i === path.length - 1
                  ? "text-secondary font-semibold cursor-default"
                  : "text-text-main/40 hover:text-text-main cursor-pointer"
              }`}
            >
              {step.name}
            </button>
          </span>
        ))}
      </div>

      {/* Back button */}
      {path.length > 0 && !selectedLeaf && (
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1.5 w-fit text-xs text-text-main/50 hover:text-text-main border border-pink-soft/20 hover:border-pink-soft/40 rounded-lg px-2.5 py-1.5 transition-all cursor-pointer"
        >
          <ChevronRight className="w-3 h-3 rotate-180" />
          Atrás
        </button>
      )}

      {/* Category buttons */}
      {!selectedLeaf && (
        <div className="flex flex-wrap gap-2">
          {currentOptions.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelect(cat)}
              className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border border-pink-soft/30 bg-background-light text-sm text-text-main/80 hover:border-pink-soft hover:bg-pink-soft/10 hover:text-text-main active:scale-95 transition-all cursor-pointer min-w-[110px]"
            >
              <span>{cat.name}</span>
              {!isLeaf(cat) && (
                <ChevronRight className="w-3.5 h-3.5 text-pink-soft/50 shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Selected leaf pill */}
      {selectedLeaf && (
        <div className="flex items-center gap-2 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full w-fit">
          <span className="text-sm text-secondary font-medium">
            {selectedLeaf.name}
          </span>
          <button
            type="button"
            onClick={handleReset}
            className="text-secondary/40 hover:text-secondary transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
