import { MapPin } from "lucide-react";
import { useGetV1Branches } from "@/lib/api";
import { BranchCard } from "../components/branch-card";
// 1. Importa Link de tanstack router
import { Link } from "@tanstack/react-router";

export function BranchesPage() {
  const { data, isLoading } = useGetV1Branches();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-400">Cargando sucursales...</p>
      </div>
    );
  }

  if (!data || data.status !== 200) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-red-400">{data?.data.message}</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-4xl tracking-tight text-charcoal dark:text-white">
          SUCURSALES
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Gestiona las ubicaciones de MARÉE
        </p>
      </div>

      {data.data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <MapPin className="w-10 h-10 text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No hay sucursales registradas
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.data.map((branch) => (
          /* 2. Envuelve la tarjeta con el componente Link */
          <Link
            key={branch.id}
            to="/admin/branches/$branchId"
            params={{ branchId: branch.name }} // Pasamos el nombre como branchId
            className="block"
          >
            <BranchCard branchId={branch.id} />
          </Link>
        ))}
      </div>
    </div>
  );
}