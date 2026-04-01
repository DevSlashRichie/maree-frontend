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
  User as UserIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { useGetV1UsersStaff } from "@/lib/api";

export const Route = createFileRoute("/admin/staff/")({
  component: RouteComponent,
});

type Staff = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  createdAt: string;
  role: string | null;
};

const ROLES = [
  { value: "administrator", label: "Administrador" },
  { value: "manager", label: "Gerente" },
  { value: "barista", label: "Barista" },
  { value: "cashier", label: "Cajero" },
];

const roleColors: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  manager: "bg-blue-100 text-blue-700",
  barista: "bg-green-100 text-green-700",
  cashier: "bg-yellow-100 text-yellow-700",
};

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  manager: "Gerente",
  barista: "Barista",
  cashier: "Cajero",
};

const columnHelper = createColumnHelper<Staff>();

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
          className={`px-3 py-1 rounded-full text-xs font-medium ${roleColors[role || ""] || "bg-gray-100 text-gray-700"
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

function StaffFormModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "barista",
    },
    onSubmit: async ({ value }) => {
      console.log("Creating staff:", value);
      onClose();
      form.reset();
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Staff"
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
                disabled={!canSubmit}
                className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50"
              >
                Crear Staff
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

  const { data, isLoading, error } = useGetV1UsersStaff(
    { page, limit: LIMIT },
    {
      swr: {
        keepPreviousData: true,
        revalidateOnFocus: false,
        shouldRetryOnError: false,
      },
    },
  );

  const staff = useMemo(() => {
    return data && data.status === 200 && Array.isArray(data.data?.users)
      ? data.data.users
      : [];
  }, [data]);

  const total =
    data && data.status === 200 && data.data?.total ? data.data.total : 0;
  const totalPages = Math.ceil(total / LIMIT);
  const start = total > 0 ? (page - 1) * LIMIT + 1 : 0;
  const end = Math.min(page * LIMIT, total);

  const table = useReactTable({
    data: staff,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handlePrevPage = () => {
    if (page > 1) setPage((page) => page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage((page) => page + 1);
  };

  if (error || (data && data.status !== 200)) {
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="font-display text-4xl text-text-main font-bold mb-2 uppercase tracking-wide">
                Staff
              </h1>
              <p className="font-body text-text-main/60">
                Gestiona los miembros del equipo
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm font-medium">Nuevo Staff</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(232,213,213,0.3)] overflow-hidden">
            {isLoading && staff.length === 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-text-main/70 bg-gray-50 border-b border-gray-100">
                        Nombre
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-text-main/70 bg-gray-50 border-b border-gray-100">
                        Teléfono
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-text-main/70 bg-gray-50 border-b border-gray-100">
                        Rol
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-text-main/70 bg-gray-50 border-b border-gray-100">
                        Fecha de creación
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(LIMIT)].map((_, i) => (
                      <tr
                        // biome-ignore lint/suspicious/noArrayIndexKey: this requires to be index
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
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <StaffFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </div>
  );
}
