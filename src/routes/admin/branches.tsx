import { createFileRoute } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { useGetV1Branches } from "@/lib/api";
import { BranchCard } from "../../features/admin/components/branch-card";

export const Route = createFileRoute("/admin/branches")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isLoading } = useGetV1Branches();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-main/40 text-sm font-body">
          Cargando sucursales...
        </p>
      </div>
    );
  }

  if (!data || data.status !== 200) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-accent text-sm font-body">{data?.data.message}</p>
      </div>
    );
  }

  const branches = data.data;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-main uppercase tracking-wide">
            Sucursales
          </h1>
          <p className="font-body text-sm text-text-main/40 mt-1">
            {branches.length} sucursal{branches.length !== 1 ? "es" : ""}{" "}
            registrada{branches.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {branches.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-pink-powder rounded-3xl mt-12">
          <MapPin className="w-8 h-8 text-text-main/20 mb-3" />
          <p className="font-body text-text-main/40 text-sm">
            No hay sucursales registradas
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch) => (
            <BranchCard key={branch.id} branch={branch} />
          ))}
        </div>
      )}
    </div>
  );
}
