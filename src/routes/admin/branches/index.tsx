import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { CreateBranchForm } from "@/features/admin/components/new-branch-form";
import {
  deleteV1BranchesId,
  useGetV1Branches,
  usePatchV1BranchesId,
} from "@/lib/api";
import type { GetV1Branches200Item } from "@/lib/schemas/getV1Branches200Item";
import { Modal } from "../../../components/ui/modal";

export const Route = createFileRoute("/admin/branches/")({
  component: RouteComponent,
});

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StateToggle({
  branch,
  onSuccess,
}: {
  branch: GetV1Branches200Item;
  onSuccess: () => void;
}) {
  const patch = usePatchV1BranchesId(branch.id);
  const [optimisticState, setOptimisticState] = useState(branch.state);
  const isActive = optimisticState === "active";

  const toggle = async () => {
    const next = isActive ? "inactive" : "active";
    setOptimisticState(next);
    try {
      await patch.trigger({ state: next });
      onSuccess();
    } catch {
      setOptimisticState(branch.state);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={patch.isMutating}
      className={`
        px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-150
        ${
          isActive
            ? "bg-purple-100 text-purple-500 hover:bg-purple-200"
            : "bg-gray-100 text-gray-400 hover:bg-gray-200"
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {patch.isMutating ? "..." : isActive ? "Abierto" : "Cerrado"}
    </button>
  );
}

function RouteComponent() {
  const { data, isLoading, mutate } = useGetV1Branches();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const result = await deleteV1BranchesId(id);
      if (result.status === 204) {
        toast.success("Sucursal eliminada");
        mutate();
      } else {
        toast.error(result.data.message || "Error al eliminar");
      }
    } catch {
      toast.error("Error al eliminar");
    } finally {
      setDeletingId(null);
    }
  };

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

  const branches = data.data
    .slice()
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-main uppercase tracking-wide">
            Sucursales
          </h1>
          <p className="font-body text-sm text-text-main/40 mt-1">
            {branches.length} sucursal{branches.length !== 1 ? "es" : ""}{" "}
            registrada{branches.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2 rounded-full 
            bg-[#2F3437] text-white
            text-xs font-bold tracking-widest uppercase 
            hover:bg-[#262A2D]
            transition-colors duration-150"
        >
          <Plus className="w-4 h-4" />
          Nueva sucursal
        </button>
      </div>

      {branches.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-pink-powder rounded-3xl">
          <MapPin className="w-8 h-8 text-text-main/20 mb-3" />
          <p className="font-body text-text-main/40 text-sm">
            No hay sucursales registradas
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-4 font-body text-sm font-semibold text-text-main/60">
                  Nombre
                </th>
                <th className="text-left px-6 py-4 font-body text-sm font-semibold text-text-main/60">
                  Estado
                </th>
                <th className="text-left px-6 py-4 font-body text-sm font-semibold text-text-main/60">
                  Fecha de creación
                </th>
                <th className="text-left px-6 py-4 font-body text-sm font-semibold text-text-main/60">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {branches.map((branch) => (
                <tr
                  key={branch.id}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors duration-100"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-text-main/40" />
                      </div>
                      <span className="font-body text-sm font-medium text-text-main">
                        {branch.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StateToggle
                      key={branch.id}
                      branch={branch}
                      onSuccess={() => mutate()}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-body text-sm text-text-main/60">
                      {formatDate(branch.createdAt)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          navigate({ to: `/admin/branches/${branch.id}` })
                        }
                        className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-150"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(branch.id)}
                        disabled={deletingId === branch.id}
                        className="p-1.5 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors duration-150 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-3 border-t border-gray-50">
            <p className="font-body text-xs text-text-main/40">
              Mostrando 1-{branches.length} de {branches.length}
            </p>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nueva Sucursal"
        description="Complete los datos para registrar una nueva sucursal en el sistema."
      >
        <CreateBranchForm
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => mutate()}
        />
      </Modal>
    </div>
  );
}
