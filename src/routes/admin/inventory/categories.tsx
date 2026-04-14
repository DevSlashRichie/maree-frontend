import { createFileRoute } from "@tanstack/react-router";
import {
  createColumnHelper,
  type ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { CategoryForm } from "@/features/admin/inventory/components/category-form";
import { useGetV1ProductsCategories } from "@/lib/api";
import type { GetCategoriesDtoItem } from "@/lib/schemas";

export const Route = createFileRoute("/admin/inventory/categories")({
  component: CategoriesPage,
});

const columnHelper = createColumnHelper<GetCategoriesDtoItem>();

function CategoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    GetCategoriesDtoItem | undefined
  >(undefined);
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const { data, isLoading, error, mutate } = useGetV1ProductsCategories({
    swr: {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  });

  const categories = useMemo(() => {
    return data && data.status === 200 && Array.isArray(data.data?.categories)
      ? data.data.categories
      : [];
  }, [data]);

  const handleCreate = useCallback(() => {
    setSelectedCategory(undefined);
    setIsModalOpen(true);
  }, []);

  const handleEdit = useCallback((category: GetCategoriesDtoItem) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  }, []);

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Nombre",
        cell: (info) => (
          <div
            className="flex items-center gap-2"
            style={{ paddingLeft: `${info.row.depth * 2}rem` }}
          >
            {info.row.getCanExpand() ? (
              <button
                className="text-black"
                {...{
                  onClick: info.row.getToggleExpandedHandler(),
                  style: { cursor: "pointer" },
                }}
              >
                {info.row.getIsExpanded() ? <ChevronDown /> : <ChevronRight />}
              </button>
            ) : (
              ""
            )}
            <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
              <Folder className="w-4 h-4 text-secondary" />
            </div>
            <p className="font-medium text-text-main truncate">
              {info.getValue()}
            </p>
          </div>
        ),
      }),
      columnHelper.accessor("id", {
        header: "ID",
        cell: (info) => (
          <span className="text-xs font-mono text-text-main/40 uppercase tracking-tighter">
            {info.getValue().split("-")[0]}...
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Acciones",
        cell: (info) => (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleEdit(info.row.original)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors text-text-main/60 hover:text-secondary"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-2 rounded-full hover:bg-gray-100 transition-colors text-text-main/60 hover:text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      }),
    ],
    [handleEdit],
  );

  const table = useReactTable<GetCategoriesDtoItem>({
    data: categories,
    columns,
    state: {
      expanded,
    },
    onExpandedChange: setExpanded,
    getSubRows: (row) =>
      row.children && row.children.length > 0 ? row.children : undefined,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowId: (row) => row.id,
  });

  const handleSubmit = async () => {
    setIsModalOpen(false);
    mutate();
  };

  if (error || (data && data.status !== 200)) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error al cargar categorías</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-4xl text-text-main font-bold mb-2 uppercase tracking-wide">
            Categorías
          </h1>
          <p className="font-body text-text-main/60">
            Gestiona las categorías de tus productos
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(232,213,213,0.3)] overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-text-main/60">
            Cargando categorías...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-6 py-4 text-left text-sm font-semibold text-text-main/70 bg-gray-50 border-b border-gray-100"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-12 text-center text-text-main/40"
                    >
                      No se encontraron categorías
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedCategory ? "Editar Categoría" : "Nueva Categoría"}
        description={
          selectedCategory
            ? "Actualiza la información de la categoría seleccionada."
            : "Crea una nueva categoría para organizar tus productos."
        }
      >
        <CategoryForm
          initialData={selectedCategory}
          categories={categories}
          onSubmit={handleSubmit}
          onClose={() => {
            setIsModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}
