import { createFileRoute, Link } from "@tanstack/react-router";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Info, Package, Loader2, AlertCircle } from "lucide-react";
import { useMemo, useState } from "react";
// Asegúrate de que esta ruta apunte a tus hooks generados
import { useGetV1ProductsVariants } from "@/lib/api"; 

export const Route = createFileRoute("/admin/inventory/products")({
  component: ProductsComponent,
});

type Variant = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  image: string | null;
  productId: string;
  createdAt: string;
  product: {
    id: string;
    image: string | null;
    name: string;
    status: string;
  };
};

const columnHelper = createColumnHelper<Variant>();

const columns = [
  columnHelper.accessor("name", {
    header: "Variante",
    cell: (info) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center border border-secondary/20">
          <Package className="w-5 h-5 text-secondary" />
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-text-main">{info.getValue()}</span>
          <span className="text-[10px] text-text-main/50 uppercase font-bold">
            {info.row.original.product.name}
          </span>
        </div>
      </div>
    ),
  }),
  columnHelper.accessor("price", {
    header: "Precio",
    cell: (info) => (
      <span className="font-semibold text-text-main">${info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("product.status", {
    header: "Estado",
    cell: (info) => {
      const isActive = info.getValue() === "active";
      return (
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
            isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {isActive ? "Activo" : "Inactivo"}
        </span>
      );
    },
  }),
  columnHelper.display({
    id: "actions",
    header: "Acción",
    cell: (info) => (
      <Link
        to="/admin/products/$productId"
        params={{ productId: info.row.original.productId }}
        className="group inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-white hover:bg-secondary/80 transition-all duration-200 font-semibold text-sm"
      >
        <Info className="w-4 h-4" />
        Detalles
      </Link>
    ),
  }),
];

function ProductsComponent() {
  const [filterStatus, setFilterStatus] = useState("all");

  // SOLUCIÓN: Pasamos undefined para evitar el error de [object Object] en la URL
  // Esto hará que la petición sea simplemente /v1/products/variants sin query params inválidos
  const { data: apiResponse, isLoading, isError } = useGetV1ProductsVariants(undefined);

  const variants = useMemo(() => apiResponse?.data?.variants || [], [apiResponse]);

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
        <p className="text-text-main/60">Cargando catálogo...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-2 text-red-500">
        <AlertCircle className="w-10 h-10" />
        <p className="font-bold">Error al cargar datos. Verifica la conexión con la DB.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-text-main uppercase">Inventario</h1>
            <p className="text-text-main/60">Datos reales desde la base de datos</p>
          </div>

          <div className="flex gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-col gap-1">
              <label htmlFor="status-select" className="text-[10px] font-bold uppercase text-text-main/40 ml-1">
                Estado
              </label>
              <select
                id="status-select"
                className="bg-gray-50 border-none rounded-lg text-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-gray-50/50">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-6 py-5 text-left text-xs font-bold uppercase text-text-main/40 border-b border-gray-100">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/20 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {filteredData.length === 0 && (
            <div className="p-20 text-center text-text-main/40 font-medium">
              No se encontraron variantes en la base de datos.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}