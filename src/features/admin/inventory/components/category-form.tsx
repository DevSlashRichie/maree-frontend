import { useForm } from "@tanstack/react-form";
import type { GetV1ProductsCategories200CategoriesItem } from "@/lib/schemas";

interface CategoryFormProps {
  initialData?: GetV1ProductsCategories200CategoriesItem;
  categories: GetV1ProductsCategories200CategoriesItem[];
  onSubmit: (values: { name: string; parentId: string | null }) => void;
  isLoading?: boolean;
}

export function CategoryForm({
  initialData,
  categories,
  onSubmit,
  isLoading,
}: CategoryFormProps) {
  const form = useForm({
    defaultValues: {
      name: initialData?.name || "",
      parentId: null as string | null,
    },
    onSubmit: async ({ value }) => {
      onSubmit(value);
    },
  });

  // Filter out the current category from being its own parent
  const availableParents = categories.filter(
    (cat) => cat.id !== initialData?.id,
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      <form.Field
        name="name"
        validators={{
          onChange: ({ value }) =>
            !value ? "El nombre es requerido" : undefined,
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <label
              htmlFor={field.name}
              className="text-sm font-medium text-text-main/80 ml-1"
            >
              Nombre de la categoría
            </label>
            <input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              type="text"
              placeholder="Ej. Bebidas, Postres..."
              className={`w-full px-4 py-3 rounded-2xl border bg-gray-50 transition-all outline-none focus:ring-2 focus:ring-secondary/20 ${
                field.state.meta.errors.length > 0
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-200 focus:border-secondary"
              }`}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-xs text-red-500 ml-1">
                {field.state.meta.errors.join(", ")}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="parentId">
        {(field) => (
          <div className="space-y-2">
            <label
              htmlFor={field.name}
              className="text-sm font-medium text-text-main/80 ml-1"
            >
              Categoría Padre (Opcional)
            </label>
            <div className="relative">
              <select
                id={field.name}
                name={field.name}
                value={field.state.value || ""}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value || null)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 transition-all outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary appearance-none cursor-pointer"
              >
                <option value="">Ninguna (Categoría Principal)</option>
                {availableParents.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-text-main/40">
                <span className="material-symbols-outlined">expand_more</span>
              </div>
            </div>
          </div>
        )}
      </form.Field>

      <div className="pt-4">
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting || isLoading}
              className="w-full bg-secondary text-white py-4 rounded-2xl font-bold hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || isLoading
                ? "Guardando..."
                : initialData
                  ? "Actualizar Categoría"
                  : "Crear Categoría"}
            </button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
