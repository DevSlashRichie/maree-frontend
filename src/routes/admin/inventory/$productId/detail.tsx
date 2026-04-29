import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";
import { ArrowLeft, Eye, EyeOff, Package, Pencil, Tag } from "lucide-react";
import { formatPrice } from "@/lib/money";

export const Route = createFileRoute("/admin/inventory/$productId/detail")({
  component: ProductDetailComponent,
});

const productIdRoute = getRouteApi("/admin/inventory/$productId");

function ProductDetailComponent() {
  const data = productIdRoute.useLoaderData();
  const priceInUnits = Number(data.priceInCents) / 100;
  const isActive = data.status === "active";

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="flex items-center gap-4">
        <Link
          to="/admin/inventory/products"
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-text-main/40 hover:text-text-main"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display text-4xl text-text-main font-bold uppercase tracking-wide">
            {data.name}
          </h1>
          <p className="font-body text-text-main/60">Detalle del producto</p>
        </div>
        <div className="ml-auto">
          <Link
            to="/admin/inventory/$productId"
            params={{ productId: data.id }}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-full hover:bg-secondary/90 transition-all font-bold text-sm"
          >
            <Pencil className="w-4 h-4" />
            Editar
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_rgba(232,213,213,0.3)] border border-gray-100/50 p-6 flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-text-main/40">
            Precio
          </span>
          <span className="font-display text-3xl font-bold text-text-main">
            {formatPrice(priceInUnits)}
          </span>
        </div>

        <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_rgba(232,213,213,0.3)] border border-gray-100/50 p-6 flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-text-main/40">
            Estado
          </span>
          <div className="flex items-center gap-2 mt-1">
            {isActive ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-600 border border-green-100">
                <Eye className="w-4 h-4" />
                <span className="text-sm font-bold uppercase tracking-wider">
                  Activo
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 text-gray-400 border border-gray-100">
                <EyeOff className="w-4 h-4" />
                <span className="text-sm font-bold uppercase tracking-wider">
                  Inactivo
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_rgba(232,213,213,0.3)] border border-gray-100/50 p-6 flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-text-main/40">
            Descripción
          </span>
          <p className="text-text-main/70 text-sm font-body">
            {data.description ?? "Sin descripción"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_rgba(232,213,213,0.3)] overflow-hidden border border-gray-100/50">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-2">
          <Tag className="w-4 h-4 text-text-main/40" />
          <h2 className="font-display font-bold text-text-main uppercase tracking-wide">
            Componentes
          </h2>
          <span className="ml-auto text-xs font-bold text-text-main/40 uppercase tracking-widest">
            {data.components.length} items
          </span>
        </div>

        {data.components.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center gap-3">
            <Package className="w-10 h-10 text-text-main/10" />
            <p className="text-text-main/40 font-medium">
              Este producto no tiene componentes.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-text-main/50 bg-gray-50/50 border-b border-gray-100">
                  Nombre
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-text-main/50 bg-gray-50/50 border-b border-gray-100">
                  Cantidad
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-text-main/50 bg-gray-50/50 border-b border-gray-100">
                  Removible
                </th>
              </tr>
            </thead>
            <tbody className="font-body">
              {data.components.map(
                (component: {
                  id: string;
                  name: string;
                  quantity: number;
                  isRemovable: boolean;
                }) => (
                  <tr
                    key={component.id}
                    className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center border border-secondary/20 shrink-0">
                          <Package className="w-4 h-4 text-secondary" />
                        </div>
                        <span className="font-medium text-text-main">
                          {component.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-text-main text-sm">
                        {component.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {component.isRemovable ? (
                        <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-600 border border-green-100 text-[10px] font-bold uppercase tracking-wider">
                          Sí
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-gray-50 text-gray-400 border border-gray-100 text-[10px] font-bold uppercase tracking-wider">
                          No
                        </span>
                      )}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
