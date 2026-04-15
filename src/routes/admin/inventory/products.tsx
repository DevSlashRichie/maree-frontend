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
  Tag,
  Info,
  Layers
} from "lucide-react";
import { useMemo } from "react";

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
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    image: null,
    name: "Hamburguesa Clásica",
    status: "active",
    category_id: "cat-123",
    created_at: "2024-03-20T10:00:00Z",
    type: "food",
  },
  {
    id: "610e8400-e29b-41d4-a716-446655440001",
    image: "https://via.placeholder.com/150",
    name: "Refresco de Cola",
    status: "inactive",
    category_id: "cat-456",
    created_at: "2024-03-21T12:00:00Z",
    type: "beverage",
  },
];

const columnHelper = createColumnHelper<Product>();

const columns = [
  columnHelper.accessor("name", {
    header: "Producto",
    cell: (info) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center overflow-hidden border border-gray-100">
          {info.row.original.image ? (
            <img src={info.row.original.image} alt="" className="w-full h-full object-cover" />
          ) : (
            <Package className="w-5 h-5 text-text-main" />
          )}
        </div>
        <span className="font-medium text-text-main">{info.getValue()}</span>
      </div>
    ),
  }),
  columnHelper.accessor("type", {
    header: "Tipo",
    cell: (info) => (
      <div className="flex items-center gap-2 text-text-main/70">
        <Layers className="w-4 h-4" />
        <span className="capitalize">{info.getValue()}</span>
      </div>
    ),
  }),
  columnHelper.accessor("status", {
    header: "Estado",
    cell: (info) => {
      const status = info.getValue();
      const isActive = status === "active";
      return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
          isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {isActive ? "Activo" : "Inactivo"}
        </span>
      );
    },
  }),
  columnHelper.accessor("id", {
    header: "Acción",
    cell: () => (
      <div className="text-secondary hover:text-secondary-dark flex items-center gap-1 font-semibold">
        <Info className="w-4 h-4" />
        Ver más
      </div>
    ),
  }),
];

function ProductsComponent() {
  const table = useReactTable({
    data: MOCK_PRODUCTS,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="min-h-screen bg-background-light p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-text-main uppercase tracking-tight">Productos</h1>
          <p className="text-text-main/60">Catálogo general de inventario</p>
        </header>

        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full border-collapse">
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
                <tr key={row.id} className="group hover:bg-secondary/5 transition-all duration-200">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 border-b border-gray-50">
                      <Link 
                        to="/admin/products/$productId" 
                        params={{ productId: row.original.id }}
                        className="block w-full"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </Link>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="px-6 py-4 flex items-center justify-between bg-white text-sm text-text-main/50">
             <span>Mostrando {MOCK_PRODUCTS.length} productos</span>
             <div className="flex gap-2">
                <button className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft /></button>
                <button className="p-2 rounded-full hover:bg-gray-100"><ChevronRight /></button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}