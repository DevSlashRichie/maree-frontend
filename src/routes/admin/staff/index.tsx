import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  Phone,
  Plus,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/modal";
import { useBranchStore } from "@/hooks/use-branch-store";
import {
  deleteV1UsersStaffUserId,
  useGetV1BranchesIdStaff,
  useGetV1UsersStaff,
  usePostAuthRegister,
} from "@/lib/api";
import type { Actor } from "@/lib/schemas";
import { BranchSelector } from "../../../features/admin/components/selector-branch";

export const Route = createFileRoute("/admin/staff/")({
  component: RouteComponent,
});

const ROLES = [
  { value: "administrator", label: "Administrador" },
  { value: "supervisor", label: "Gerente" },
  { value: "waiter", label: "Mesero" },
  { value: "cashier", label: "Cajero" },
];

const roleColors: Record<string, string> = {
  administrator: "bg-purple-100 text-purple-700",
  supervisor: "bg-blue-100 text-blue-700",
  waiter: "bg-green-100 text-green-700",
  cashier: "bg-yellow-100 text-yellow-700",
};

const roleLabels: Record<string, string> = {
  administrator: "Administrador",
  supervisor: "Gerente",
  waiter: "Mesero",
  cashier: "Cajero",
};

const columnHelper = createColumnHelper<Actor>();

const columns = [
  columnHelper.accessor("firstName", {
    header: "Nombre",
    cell: (info) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
          <UserIcon className="w-5 h-5 text-text-main" />
        </div>
        <div>
          <p className="font-medium text-text-main">
            {info.row.original.firstName} {info.row.original.lastName}
          </p>
        </div>
      </div>
    ),
  }),
  columnHelper.accessor("phone", {
    header: "Teléfono",
    cell: (info) => (
      <div className="flex items-center gap-2 text-text-main/70">
        <Phone className="w-4 h-4" />
        <span>{info.getValue()}</span>
      </div>
    ),
  }),
  columnHelper.accessor("role", {
    header: "Rol",
    cell: (info) => {
      const role = info.getValue();
      return (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            roleColors[role || ""] || "bg-gray-100 text-gray-700"
          }`}
        >
          {roleLabels[role || ""] || role}
        </span>
      );
    },
  }),
  columnHelper.accessor("createdAt", {
    header: "Fecha de creación",
    cell: (info) => {
      const date = new Date(info.getValue());
      return (
        <span className="text-text-main/60">
          {date.toLocaleDateString("es-CL", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      );
    },
  }),
];

interface StaffPayload {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  role: string;
  branchId?: string;
}

function StaffFormModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { trigger: registerUser, isMutating } = usePostAuthRegister();
  const { selectedBranch } = useBranchStore();

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "",
    },
    onSubmit: async ({ value }) => {
      try {
        const payload: StaffPayload = {
          firstName: value.firstName,
          lastName: value.lastName,
          phone: value.phone,
          role: value.role,
          branchId: selectedBranch?.id,
        };

        const result = (await registerUser(payload)) as {
          status?: number;
          statusCode?: number;
          data?: { message?: string | string[] };
        };

        const status = result?.status || result?.statusCode;

        if (status === 201) {
          toast.success(
            selectedBranch
              ? `Staff agregado a ${selectedBranch.name}`
              : "Staff creado correctamente",
          );
          form.reset();
          onSuccess();
          onClose();
          return;
        }

        if (status === 409) {
          toast.error("El teléfono o email ya está en uso");
          return;
        }

        const errorData = result?.data as
          | { message?: string | string[] }
          | undefined;
        const message = Array.isArray(errorData?.message)
          ? errorData.message.join(", ")
          : (errorData?.message ??
            `Error inesperado (${status ?? "sin status"})`);
        toast.error(message);
      } catch (error) {
        const err = error as {
          response?: {
            status?: number;
            data?: { message?: string | string[] };
          };
          message?: string;
        };

        if (err.response?.status === 409) {
          toast.error("El teléfono o email ya está en uso");
          return;
        }

        const message = Array.isArray(err.response?.data?.message)
          ? err.response.data.message.join(", ")
          : (err.response?.data?.message ??
            err.message ??
            "Error del servidor");

        toast.error(message);
      }
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Nuevo Staff - Sucursal: ${selectedBranch?.name ?? ""}`}
      description="Completa los datos del nuevo miembro del equipo"
      maxWidth="md"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <form.Field name="firstName">
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="block text-sm font-medium text-text-main mb-2"
                >
                  Nombre
                </label>
                <input
                  id={field.name}
                  type="text"
                  required
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
                  placeholder="Ej: Juan"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="lastName">
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="block text-sm font-medium text-text-main mb-2"
                >
                  Apellido
                </label>
                <input
                  id={field.name}
                  type="text"
                  required
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
                  placeholder="Ej: Pérez"
                />
              </div>
            )}
          </form.Field>
        </div>

        <form.Field name="email">
          {(field) => (
            <div>
              <label
                htmlFor={field.name}
                className="block text-sm font-medium text-text-main mb-2"
              >
                Email (opcional)
              </label>
              <input
                id={field.name}
                type="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
                placeholder="juan@ejemplo.cl"
              />
            </div>
          )}
        </form.Field>

        <form.Field name="phone">
          {(field) => (
            <div>
              <label
                htmlFor={field.name}
                className="block text-sm font-medium text-text-main mb-2"
              >
                Teléfono
              </label>
              <input
                id={field.name}
                type="tel"
                required
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
                placeholder="+56912345678"
              />
            </div>
          )}
        </form.Field>

        <form.Field name="role">
          {(field) => (
            <div>
              <label
                htmlFor={field.name}
                className="block text-sm font-medium text-text-main mb-2"
              >
                Rol
              </label>
              <select
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
              >
                <option disabled value="">
                  Selecciona un rol
                </option>
                {ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
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
          <form.Subscribe selector={(state) => state.canSubmit}>
            {(canSubmit) => (
              <button
                type="submit"
                disabled={!canSubmit || isMutating}
                className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {isMutating ? "Creando..." : "Crear Staff"}
              </button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </Modal>
  );
}

const LIMIT = 5;

function RouteComponent() {
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { selectedBranch } = useBranchStore();

  const {
    data: allStaffData,
    isLoading: isAllStaffLoading,
    error,
    mutate: mutateAll,
  } = useGetV1UsersStaff(
    { page, limit: LIMIT },
    {
      swr: {
        keepPreviousData: true,
        revalidateOnFocus: false,
        shouldRetryOnError: false,
        enabled: !selectedBranch,
      },
    },
  );

  const {
    data: branchStaffData,
    isLoading: isBranchStaffLoading,
    mutate: mutateBranch,
  } = useGetV1BranchesIdStaff(selectedBranch?.id ?? "", {
    swr: {
      keepPreviousData: true,
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      enabled: !!selectedBranch,
    },
  });

  const isLoading = selectedBranch ? isBranchStaffLoading : isAllStaffLoading;

  const staff = useMemo(() => {
    if (selectedBranch) {
      return branchStaffData?.status === 200 ? branchStaffData.data : [];
    }
    return allStaffData?.status === 200 &&
      Array.isArray(allStaffData.data?.users)
      ? allStaffData.data.users
      : [];
  }, [selectedBranch, branchStaffData, allStaffData]);

  const total =
    !selectedBranch && allStaffData?.status === 200 && allStaffData.data?.total
      ? allStaffData.data.total
      : staff.length;
  const totalPages = Math.ceil(total / LIMIT);
  const start = total > 0 ? (page - 1) * LIMIT + 1 : 0;
  const end = Math.min(page * LIMIT, total);

  const table = useReactTable({
    data: staff,
    columns: [
      ...columns,
      columnHelper.display({
        id: "actions",
        header: "Acciones",
        cell: (info) => (
          <div className="flex justify-end pr-4">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(info.row.original.id);
              }}
              className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ),
      }),
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  const handlePrevPage = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage((p) => p + 1);
  };

  const handleSuccess = () => {
    if (selectedBranch) {
      mutateBranch();
    } else {
      mutateAll();
    }
  };

  const handleDelete = async (userId: string) => {
    if (
      !window.confirm(
        "¿Estás seguro de que deseas eliminar a este miembro del staff?",
      )
    ) {
      return;
    }

    try {
      const result = await deleteV1UsersStaffUserId(userId);
      if (result.status === 200) {
        toast.success("Staff eliminado correctamente");
        handleSuccess();
      } else {
        toast.error("Error al eliminar staff");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar staff");
    }
  };

  if (
    error ||
    (!selectedBranch && allStaffData && allStaffData.status !== 200)
  ) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error al cargar staff</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="font-display text-4xl text-text-main font-bold mb-2 uppercase tracking-wide">
                Staff
              </h1>
              {selectedBranch ? (
                <p className="font-body text-sm text-text-main/60">
                  Mostrando staff de{" "}
                  <span className="font-semibold text-text-main">
                    {selectedBranch.name}
                  </span>
                </p>
              ) : (
                <p className="font-body text-text-main/60">
                  Selecciona una sucursal para ver staff
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <BranchSelector />
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="text-sm font-medium">Nuevo Staff</span>
              </button>
            </div>
          </div>

          {!selectedBranch ? (
            <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(232,213,213,0.3)] flex items-center justify-center py-24">
              <p className="text-text-main/60">
                Selecciona una sucursal para ver y crear staff
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(232,213,213,0.3)] overflow-hidden">
              {isLoading && staff.length === 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        {["Nombre", "Teléfono", "Rol", "Fecha de creación"].map(
                          (h) => (
                            <th
                              key={h}
                              className="px-6 py-4 text-left text-sm font-semibold text-text-main/70 bg-gray-50 border-b border-gray-100"
                            >
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {[...Array(LIMIT)].map((_, i) => (
                        <tr
                          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows
                          key={`skeleton-${i}`}
                          className="border-b border-gray-100 last:border-0"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <>
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
                            className="cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                          >
                            {row.getVisibleCells().map((cell) => (
                              <td key={cell.id} className="px-6 py-4">
                                <button
                                  type="button"
                                  onClick={() => {
                                    window.location.href = `/admin/staff/${row.original.id}`;
                                  }}
                                  className="block w-full text-left"
                                >
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext(),
                                  )}
                                </button>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm text-text-main/60">
                      Mostrando {start}-{end} de {total}
                    </span>
                    {!selectedBranch && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handlePrevPage}
                          disabled={page === 1 || isLoading}
                          className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-5 h-5 text-text-main" />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextPage}
                          disabled={page >= totalPages || isLoading}
                          className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-5 h-5 text-text-main" />
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <StaffFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
