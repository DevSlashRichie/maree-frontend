import { createFileRoute, Link } from "@tanstack/react-router";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  Package,
  Info,
  Layers,
  Filter
} from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/admin/inventory/products")({
  component: ProductsComponent,
});

type Product = {
  id: string;
  image: string | null;
  name: string;
  status: string;
  category_id: string;
  created_at: string;
  type: string;
};

const MOCK_PRODUCTS: Product[] = [
  { id: "1", image: null, name: "Hamburguesa Clásica", status: "active", category_id: "comida", created_at: "2024-03-20", type: "food" },
  { id: "2", image: null, name: "Refresco de Cola", status: "inactive", category_id: "bebida", created_at: "2024-03-21", type: "beverage" },
  { id: "3", image: null, name: "Papas Fritas", status: "active", category_id: "comida", created_at: "2024-03-22", type: "food" },
];

const columnHelper = createColumnHelper<Product>();

const columns = [
  columnHelper.accessor("name", {
    header: "Producto",
    cell: (info) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center border border-gray-100">
          <Package className="w-5 h-5 text-text-main" />
        </div>
        <span className="font-medium text-text-main">{info.getValue()}</span>
      </div>
    ),
  }),
  columnHelper.accessor("category_id", {
    header: "Categoría",
    cell: (info) => <span className="capitalize text-text-main/70">{info.getValue()}</span>,
  }),
  columnHelper.accessor("status", {
    header: "Estado",
    cell: (info) => {
      const isActive = info.getValue() === "active";
      return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
          isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
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
        params={{ productId: info.row.original.id }}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary hover:text-white transition-all duration-200 font-semibold text-sm"
      >
        <Info className="w-4 h-4" />
        Ver detalles
      </Link>
    ),
  }),
];

function ProductsComponent() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  const filteredData = useMemo(() => {
    return MOCK_PRODUCTS.filter((p) => {
      const matchStatus = filterStatus === "all" || p.status === filterStatus;
      const matchCategory = filterCategory === "all" || p.category_id === filterCategory;
      return matchStatus && matchCategory;
    });
  }, [filterStatus, filterCategory]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="min-h-screen bg-background-light p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-text-main uppercase">Catálogo</h1>
            <p className="text-text-main/60">Gestiona tus productos y existencias</p>
          </div>

          {/* SECCIÓN DE FILTROS */}
          <div className="flex gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-text-main/40 ml-1">Estado</label>
              <select 
                className="bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-secondary/20"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-text-main/40 ml-1">Categoría</label>
              <select 
                className="bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-secondary/20"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">Todas</option>
                <option value="comida">Comida</option>
                <option value="bebida">Bebida</option>
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
                    <th key={header.id} className="px-6 py-5 text-left text-xs font-bold uppercase tracking-widest text-text-main/40 border-b border-gray-100">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 last:border-none">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 text-text-main">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredData.length === 0 && (
            <div className="p-20 text-center text-text-main/40 font-medium">
              No se encontraron productos con esos filtros.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}