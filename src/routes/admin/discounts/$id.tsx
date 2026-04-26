import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Hash,
  Pencil,
  Tag,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/modal";
import { useGetV1DiscountsId, usePatchV1DiscountsId } from "@/lib/api";
import type { GetV1DiscountsId200 } from "@/lib/schemas";

export const Route = createFileRoute("/admin/discounts/$id")({
  component: RouteComponent,
});

const DISCOUNT_TYPES = [
  { value: "percentage", label: "Porcentaje (%)" },
  { value: "fixed", label: "Monto Fijo ($)" },
];

const DISCOUNT_STATES = [
  { value: "active", label: "Activo" },
  { value: "inactive", label: "Inactivo" },
];

function DiscountEditModal({
  discount,
  isOpen,
  onClose,
  onSuccess,
}: {
  discount: GetV1DiscountsId200;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { trigger: updateDiscount, isMutating } = usePatchV1DiscountsId(
    discount.id,
  );

  const form = useForm({
    defaultValues: {
      name: discount.name,
      type: discount.type as "percentage" | "fixed",
      value: discount.value,
      code: discount.code || "",
      state: discount.state as "active" | "inactive",
      startDate: new Date(discount.startDate).toISOString().split("T")[0],
      endDate: new Date(discount.endDate).toISOString().split("T")[0],
      maxUses: discount.maxUses || 0,
      hidden: discount.hidden,
    },
    onSubmit: async ({ value }) => {
      try {
        const payload = {
          ...value,
          maxUses: value.maxUses > 0 ? value.maxUses : undefined,
          code: value.code || undefined,
          startDate: new Date(value.startDate).toISOString(),
          endDate: new Date(value.endDate).toISOString(),
          value: value.value,
        };

        const result = await updateDiscount(payload);

        if (result.status === 200) {
          toast.success("Descuento actualizado");
          onSuccess();
          onClose();
        } else {
          toast.error("Error al actualizar");
        }
      } catch (_error) {
        toast.error("Error del servidor");
      }
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Descuento"
      description="Actualiza los parámetros de esta promoción"
      maxWidth="md"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <form.Field name="name">
          {(field) => (
            <div>
              <label
                htmlFor={field.name}
                className="block text-sm font-medium text-text-main mb-1"
              >
                Nombre del Descuento
              </label>
              <input
                id={field.name}
                type="text"
                required
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary/30 outline-none"
              />
            </div>
          )}
        </form.Field>

        <div className="grid grid-cols-2 gap-4">
          <form.Field name="type">
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="block text-sm font-medium text-text-main mb-1"
                >
                  Tipo
                </label>
                <select
                  id={field.name}
                  value={field.state.value}
                  onChange={(e) =>
                    field.handleChange(e.target.value as "percentage" | "fixed")
                  }
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary/30 outline-none"
                >
                  {DISCOUNT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </form.Field>

          <form.Field name="value">
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="block text-sm font-medium text-text-main mb-1"
                >
                  Valor
                </label>
                <input
                  id={field.name}
                  type="number"
                  required
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary/30 outline-none"
                />
              </div>
            )}
          </form.Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <form.Field name="code">
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="block text-sm font-medium text-text-main mb-1"
                >
                  Código
                </label>
                <input
                  id={field.name}
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary/30 outline-none"
                  placeholder="N/A"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="state">
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="block text-sm font-medium text-text-main mb-1"
                >
                  Estado
                </label>
                <select
                  id={field.name}
                  value={field.state.value}
                  onChange={(e) =>
                    field.handleChange(e.target.value as "active" | "inactive")
                  }
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary/30 outline-none"
                >
                  {DISCOUNT_STATES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </form.Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <form.Field name="startDate">
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="block text-sm font-medium text-text-main mb-1"
                >
                  Fecha Inicio
                </label>
                <input
                  id={field.name}
                  type="date"
                  required
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary/30 outline-none"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="endDate">
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="block text-sm font-medium text-text-main mb-1"
                >
                  Fecha Fin
                </label>
                <input
                  id={field.name}
                  type="date"
                  required
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary/30 outline-none"
                />
              </div>
            )}
          </form.Field>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-gray-500 hover:text-text-main transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isMutating}
            className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {isMutating ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function RouteComponent() {
  const params = Route.useParams();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data, isLoading, error, mutate } = useGetV1DiscountsId(params.id, {
    swr: {
      revalidateOnFocus: false,
    },
  });

  const discount = data?.status === 200 ? data.data : null;

  if (error || (data && data.status !== 200)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-500 mb-4 font-medium">
            Error al cargar el descuento
          </p>
          <Link
            to="/admin/discounts"
            className="text-secondary hover:underline font-medium"
          >
            Volver al listado
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading || !discount) {
    return (
      <div className="p-8 animate-pulse text-center text-text-main/60">
        Cargando detalles del descuento...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/admin/discounts"
            className="inline-flex items-center gap-2 text-text-main/60 hover:text-text-main mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Volver al listado</span>
          </Link>

          <div className="flex flex-col md:flex-row gap-6">
            <aside className="w-full md:w-64 flex-shrink-0">
              <div className="bg-white rounded-2xl border border-black/[0.06] p-6 sticky top-8">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-[#E8E4DF] flex items-center justify-center mb-4">
                    <Tag className="w-8 h-8 text-text-main/40" />
                  </div>
                  <h1 className="text-base font-bold text-text-main leading-tight">
                    {discount.name}
                  </h1>
                  <span
                    className={`mt-1.5 px-3 py-0.5 rounded-full text-xs font-medium ${
                      discount.state === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {discount.state === "active" ? "Activo" : "Inactivo"}
                  </span>
                  <div className="mt-4">
                    <p className="text-xs font-bold text-text-main/40 uppercase tracking-widest mb-1">
                      Valor
                    </p>
                    <p className="text-2xl font-black text-text-main">
                      {discount.type === "percentage"
                        ? `${discount.value}%`
                        : `$${discount.value}`}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#2F3437] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#2F3437]/90 transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                  Editar
                </button>
              </div>
            </aside>

            <main className="flex-1">
              <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Hash className="w-5 h-5 text-text-main/40" />
                    <span className="text-sm font-medium text-text-main/60">
                      Código Promo
                    </span>
                  </div>
                  <p className="text-text-main font-medium ml-8">
                    {discount.code || "Sin código"}
                  </p>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-text-main/40" />
                    <span className="text-sm font-medium text-text-main/60">
                      Vigencia
                    </span>
                  </div>
                  <p className="text-text-main font-medium ml-8">
                    {new Date(discount.startDate).toLocaleDateString("es-CL")} -{" "}
                    {new Date(discount.endDate).toLocaleDateString("es-CL")}
                  </p>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-5 h-5 text-text-main/40" />
                    <span className="text-sm font-medium text-text-main/60">
                      Uso
                    </span>
                  </div>
                  <p className="text-text-main font-medium ml-8">
                    {discount.currentUses}{" "}
                    {discount.maxUses ? `/ ${discount.maxUses}` : "usos"}
                  </p>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5 text-text-main/40" />
                    <span className="text-sm font-medium text-text-main/60">
                      Creación
                    </span>
                  </div>
                  <p className="text-text-main font-medium ml-8">
                    {new Date(discount.createdAt).toLocaleString("es-CL")}
                  </p>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-3">
                    {discount.isActive === "true" ||
                    (discount.state === "active" &&
                      new Date(discount.endDate) > new Date()) ? (
                      <div className="flex items-center gap-3 text-green-600 font-bold uppercase tracking-widest text-xs">
                        <CheckCircle className="w-5 h-5" />
                        PROMOCIÓN VÁLIDA
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-red-500 font-bold uppercase tracking-widest text-xs">
                        <XCircle className="w-5 h-5" />
                        FUERA DE VIGENCIA / INACTIVO
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      <DiscountEditModal
        discount={discount}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={mutate}
      />
    </div>
  );
}
