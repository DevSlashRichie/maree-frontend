import { useForm } from "@tanstack/react-form";
import toast from "react-hot-toast";
import {
  usePatchV1ProductsCategoriesId,
  usePostV1ProductsCategories,
} from "@/lib/api";
import type { GetCategoriesDtoItem } from "@/lib/schemas";

interface CategoryFormProps {
  initialData?: GetCategoriesDtoItem;
  categories: GetCategoriesDtoItem[];
  onSubmit: () => void;
  isLoading?: boolean;
  onClose?: () => void;
}

export function CategoryForm({
  initialData,
  categories,
  onSubmit,
  isLoading,
  onClose,
}: CategoryFormProps) {
  const { trigger: createCategory } = usePostV1ProductsCategories();
  const { trigger: updateCategory } = usePatchV1ProductsCategoriesId(
    initialData?.id || "",
  );

  const form = useForm({
    defaultValues: {
      name: initialData?.name || "",
      parentId: (initialData?.parentId || null) as string | null,
      public: initialData?.public ?? true,
    },
    onSubmit: async ({ value }) => {
      try {
        if (initialData) {
          const result = await updateCategory(value);
          if (result.status === 200) {
            toast.success("Categoría actualizada");
          } else {
            throw new Error("Error al actualizar");
          }
        } else {
          const result = await createCategory(value);
          if (result.status === 201) {
            toast.success("Categoría creada");
          } else {
            throw new Error("Error al crear");
          }
        }
        onSubmit();
      } catch (error) {
        console.error("Error saving category:", error);
        toast.error("Error al guardar la categoría");
      }
    },
  });

  type CategoryNode = { id: string; children?: CategoryNode[] };
  const aux = (input: CategoryNode[]): CategoryNode[] =>
    input.flatMap((node) => [node, ...aux(node.children ?? [])]);

  // Filter out the current category from being its own parent
  const availableParents = aux(categories).filter(
    (cat: GetCategoriesDtoItem) => cat.id !== initialData?.id,
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
                {availableParents.map((cat: GetCategoriesDtoItem) => (
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

      <form.Field name="public">
        {(field) => (
          <div className="flex items-center gap-3 px-1">
            <button
              type="button"
              onClick={() => field.handleChange(!field.state.value)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-secondary/20 ${
                field.state.value ? "bg-secondary" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  field.state.value ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-text-main/80">
                Pública
              </span>
              <span className="text-xs text-text-main/40">
                Determina si la categoría es visible para los clientes
              </span>
            </div>
          </div>
        )}
      </form.Field>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 text-sm font-medium text-gray-500 hover:text-text-main transition-colors"
        >
          Cancelar
        </button>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting || isLoading}
              className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50"
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
