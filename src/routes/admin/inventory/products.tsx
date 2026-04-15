import { createFileRoute, Link } from "@tanstack/react-router";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Info, Package, Loader2, AlertCircle, Plus, Tag, Eye, EyeOff } from "lucide-react";
import { useMemo, useState } from "react";
// Usando tus hooks generados
import { useGetV1ProductsVariants, useGetV1ProductsCategories } from "@/lib/api"; 

export const Route = createFileRoute("/admin/inventory/products")({
  component: ProductsComponent,
});

// Definición de tipos basada en tus esquemas de API
type Category = {
  id: string;
  name: string;
  parentId: string | null;
  public: boolean;
  children?: Category[];
};

type Variant = {
  id: string;
  name: string;
  price: string;
  productId: string;
  product: {
    id: string;
    name: string;
    status: string;
    categoryId: string; //
  };
};

// Función auxiliar para aplanar el árbol de categorías y facilitar la búsqueda por ID
const findCategoryName = (categories: Category[], id: string): string => {
  for (const cat of categories) {
    if (cat.id === id) return cat.name;
    if (cat.children) {
      const found = findCategoryName(cat.children, id);
      if (found !== "Sin categoría") return found;
    }
  }
  return "Sin categoría";
};

const columnHelper = createColumnHelper<Variant>();

function ProductsComponent() {
  const [filterStatus, setFilterStatus] = useState("all");

  // 1. Hook para obtener categorías (el árbol completo)
  const { data: catResponse } = useGetV1ProductsCategories();
  
  // 2. Hook para obtener variantes
  const { data: apiResponse, isLoading, isError } = useGetV1ProductsVariants(undefined);

  const categories = useMemo(() => catResponse?.data?.categories || [], [catResponse]);
  const variants = useMemo(() => apiResponse?.data?.variants || [], [apiResponse]);

  const columns = useMemo(() => [
    columnHelper.accessor("name", {
      header: "Producto / Variante",
      cell: (info) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center border border-secondary/20 shrink-0">
            <Package className="w-5 h-5 text-secondary" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-text-main truncate">{info.getValue()}</span>
            <span className="text-[10px] text-text-main/50 uppercase font-bold tracking-wider">
              {info.row.original.product.name}
            </span>
          </div>
        </div>
      ),
    }),
    columnHelper.display({
      id: "category",
      header: "Categoría",
      cell: (info) => {
        const catId = info.row.original.product.categoryId;
        const categoryName = findCategoryName(categories, catId);
        return (
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-text-main/40" />
            <span className="text-text-main/70 text-sm">{categoryName}</span>
          </div>
        );
      },
    }),
    columnHelper.accessor("price", {
      header: "Precio",
      cell: (info) => (
        <span className="font-semibold text-text-main text-sm">
          ${parseFloat(info.getValue()).toLocaleString()}
        </span>
      ),
    }),
    columnHelper.accessor("product.status", {
      header: "Estado",
      cell: (info) => {
        const isActive = info.getValue() === "active";
        return (
          <div className="flex items-center gap-1.5">
            {isActive ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-600 border border-green-100">
                <Eye className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Activo</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 text-gray-400 border border-gray-100">
                <EyeOff className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Inactivo</span>
              </div>
            )}
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Acciones",
      cell: (info) => (
        <Link
          to="/admin/products/$productId"
          params={{ productId: info.row.original.productId }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-white hover:bg-secondary/90 transition-colors font-semibold text-xs"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Detalles</span>
        </Link>
      ),
    }),
  ], [categories]);

  const filteredData = useMemo(() => {
    return variants.filter((v: Variant) => {
      const matchStatus = filterStatus === "all" || v.product.status === filterStatus;
      return matchStatus;
    });
  }, [variants, filterStatus]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
        <p className="text-text-main/60 font-body animate-pulse">Cargando inventario...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
        <div className="p-4 rounded-full bg-red-50">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <p className="font-display font-bold text-red-500 text-lg text-center px-4">
          Error al conectar con la base de datos.<br/>
          <span className="text-sm font-normal">Verifica que el backend esté corriendo en el puerto 8383.</span>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="font-display text-4xl text-text-main font-bold mb-2 uppercase tracking-wide">
            Inventario
          </h1>
          <p className="font-body text-text-main/60">
            Gestiona los productos y sus variantes disponibles
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
            <span className="text-[10px] font-bold uppercase text-text-main/40 tracking-widest">Estado:</span>
            <select
              className="bg-transparent border-none text-sm font-semibold text-text-main focus:ring-0 cursor-pointer p-0"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>

          <Link
            to="/admin/products/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full hover:bg-primary/90 transition-all shadow-md shadow-primary/20 font-bold tracking-tight"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Producto</span>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_rgba(232,213,213,0.3)] overflow-hidden border border-gray-100/50">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-5 text-left text-xs font-bold uppercase tracking-widest text-text-main/50 bg-gray-50/50 border-b border-gray-100"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="font-body">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="p-20 text-center flex flex-col items-center gap-3">
            <Package className="w-12 h-12 text-text-main/10" />
            <p className="text-text-main/40 font-medium">No se encontraron productos en esta sección.</p>
          </div>
        )}
      </div>
    </div>
  );
}