import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Mail, Pencil, Phone, Shield } from "lucide-react";
import { useState } from "react";
import { PhoneInput } from "@/components/phone-input";
import { Modal } from "@/components/ui/modal";
import { useGetV1UsersStaffUserId } from "@/lib/api";
import type { Actor } from "@/lib/schemas";

export const Route = createFileRoute("/admin/staff/$id")({
  component: RouteComponent,
});

const ROLES = [
  { value: "administrator", label: "Administrador" },
  { value: "supervisor", label: "Supervisor" },
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
  supervisor: "Supervisor",
  waiter: "Mesero",
  cashier: "Cajero",
};

function StaffEditModal({
  staff,
  isOpen,
  onClose,
}: {
  staff: Actor;
  isOpen: boolean;
  onClose: () => void;
}) {
  const form = useForm({
    defaultValues: {
      firstName: staff.firstName,
      lastName: staff.lastName,
      email: staff.email || "",
      phone: staff.phone,
      role: staff.role || "barista",
    },
    onSubmit: async ({ value }) => {
      console.log("Updating staff:", staff.id, value);
      onClose();
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Staff"
      description="Actualiza los datos del miembro del equipo"
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
            <PhoneInput
              id={field.name}
              label="Teléfono"
              required
              value={field.state.value || ""}
              onChange={(val) => field.handleChange(val)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-secondary/30 focus-within:border-secondary transition-all"
              labelClassName="block text-sm font-medium text-text-main mb-2"
              placeholder="+56912345678"
            />
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
                Guardar cambios
              </button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </Modal>
  );
}

function RouteComponent() {
  const params = Route.useParams();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data, isLoading, error } = useGetV1UsersStaffUserId(params.id, {
    swr: {
      keepPreviousData: true,
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  });

  const staff: Actor | null = data && data.status === 200 ? data.data : null;

  if (error || (data && data.status !== 200)) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error al cargar staff</p>
          <Link to="/admin/staff" className="text-secondary hover:underline">
            Volver al listado
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading && !staff) {
    return (
      <div className="min-h-screen bg-background-light">
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <Link
              to="/admin/staff"
              className="inline-flex items-center gap-2 text-text-main/60 hover:text-text-main mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Volver al listado</span>
            </Link>

            <div className="flex flex-col md:flex-row gap-6">
              <aside className="w-full md:w-72 flex-shrink-0">
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse mb-4" />
                    <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              </aside>

              <main className="flex-1">
                <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
                  {[...Array(4)].map((_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: index required for skeleton
                    <div key={i} className="p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                      </div>
                      <div className="h-5 w-32 bg-gray-200 rounded animate-pulse ml-8" />
                    </div>
                  ))}
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-main/60 mb-4">Staff no encontrado</p>
          <Link to="/admin/staff" className="text-secondary hover:underline">
            Volver al listado
          </Link>
        </div>
      </div>
    );
  }

  const initials = `${staff.firstName[0]}${staff.lastName[0]}`.toUpperCase();

  return (
    <div className="min-h-screen bg-background-light">
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/admin/staff"
            className="inline-flex items-center gap-2 text-text-main/60 hover:text-text-main mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Volver al listado</span>
          </Link>

          <div className="flex flex-col md:flex-row gap-6">
            <aside className="w-full md:w-72 flex-shrink-0">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-8">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-4">
                    <span className="text-3xl font-bold text-text-main">
                      {initials}
                    </span>
                  </div>
                  <h1 className="text-xl font-bold text-text-main">
                    {staff.firstName} {staff.lastName}
                  </h1>
                  <span
                    className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                      roleColors[staff.role || ""] ||
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {roleLabels[staff.role || ""] || "Sin rol"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Editar información
                </button>
              </div>
            </aside>

            <main className="flex-1">
              <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="w-5 h-5 text-text-main/40" />
                    <span className="text-sm font-medium text-text-main/60">
                      Email
                    </span>
                  </div>
                  <p className="text-text-main font-medium ml-8">
                    {staff.email || "No disponible"}
                  </p>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Phone className="w-5 h-5 text-text-main/40" />
                    <span className="text-sm font-medium text-text-main/60">
                      Teléfono
                    </span>
                  </div>
                  <p className="text-text-main font-medium ml-8">
                    {staff.phone}
                  </p>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-5 h-5 text-text-main/40" />
                    <span className="text-sm font-medium text-text-main/60">
                      Rol
                    </span>
                  </div>
                  <p className="text-text-main font-medium ml-8">
                    {roleLabels[staff.role || ""] || "Sin rol asignado"}
                  </p>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-text-main/40" />
                    <span className="text-sm font-medium text-text-main/60">
                      Fecha de creación
                    </span>
                  </div>
                  <p className="text-text-main font-medium ml-8">
                    {new Date(staff.createdAt).toLocaleDateString("es-CL", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      <StaffEditModal
        staff={staff}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
}
