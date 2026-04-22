import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Calendar, Hash, Percent, Plus, Tag, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/modal";
import {
  deleteV1DiscountsId,
  useGetV1Discounts,
  usePostV1Discounts,
} from "@/lib/api";
import type { GetV1Discounts200Item } from "@/lib/schemas";

export const Route = createFileRoute("/admin/discounts/")({
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

const stateColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-700",
};

const columnHelper = createColumnHelper<GetV1Discounts200Item>();

const columns = [
  columnHelper.accessor("name", {
    header: "Nombre",
    cell: (info) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
          <Tag className="w-5 h-5 text-text-main" />
        </div>
        <span className="font-medium text-text-main">{info.getValue()}</span>
      </div>
    ),
  }),
  columnHelper.accessor("code", {
    header: "Código",
    cell: (info) => (
      <div className="flex items-center gap-2 text-text-main/70">
        <Hash className="w-4 h-4" />
        <span>{info.getValue() || "N/A"}</span>
      </div>
    ),
  }),
  columnHelper.accessor("type", {
    header: "Tipo",
    cell: (info) => {
      const type = info.getValue();
      return (
        <div className="flex items-center gap-2">
          {type === "percentage" ? (
            <Percent className="w-4 h-4 text-blue-500" />
          ) : (
            <span className="font-bold text-green-500">$</span>
          )}
          <span>{type === "percentage" ? "Porcentaje" : "Fijo"}</span>
        </div>
      );
    },
  }),
  columnHelper.accessor("value", {
    header: "Valor",
    cell: (info) => {
      const type = info.row.original.type;
      const value = info.getValue();
      return (
        <span className="font-semibold text-text-main">
          {type === "percentage" ? `${value}%` : `$${value}`}
        </span>
      );
    },
  }),
  columnHelper.accessor("state", {
    header: "Estado",
    cell: (info) => {
      const state = info.getValue();
      return (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            stateColors[state] || "bg-gray-100 text-gray-700"
          }`}
        >
          {state === "active" ? "Activo" : "Inactivo"}
        </span>
      );
    },
  }),
  columnHelper.accessor("endDate", {
    header: "Vence",
    cell: (info) => {
      const date = new Date(info.getValue());
      return (
        <div className="flex items-center gap-2 text-text-main/60">
          <Calendar className="w-4 h-4" />
          <span>
            {date.toLocaleDateString("es-CL", {
              day: "2-digit",
              month: "short",
            })}
          </span>
        </div>
      );
    },
  }),
];

function DiscountFormModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { trigger: createDiscount, isMutating } = usePostV1Discounts();

  const form = useForm({
    defaultValues: {
      name: "",
      type: "percentage" as "percentage" | "fixed",
      value: "",
      code: "",
      state: "active" as "active" | "inactive",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      maxUses: 0,
      hidden: false,
    },
    onSubmit: async ({ value }) => {
      try {
        const payload = {
          ...value,
          appliesTo: [], // Default to empty array as required by schema
          maxUses: value.maxUses > 0 ? value.maxUses : undefined,
          code: value.code || undefined,
          startDate: new Date(value.startDate).toISOString(),
          endDate: new Date(value.endDate).toISOString(),
          value: value.value,
        };

        const result = await createDiscount(payload);

        if (result.status === 201) {
          toast.success("Descuento creado correctamente");
          form.reset();
          onSuccess();
          onClose();
        } else {
          toast.error("Error al crear el descuento");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error al conectar con el servidor");
      }
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Descuento"
      description="Crea una nueva promoción o descuento para tus clientes"
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
                placeholder="Ej: Promo Verano"
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
                  onChange={(e) => field.handleChange(e.target.value as any)}
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
                  placeholder="20"
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
                  Código (opcional)
                </label>
                <input
                  id={field.name}
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary/30 outline-none"
                  placeholder="VERANO2024"
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
                  onChange={(e) => field.handleChange(e.target.value as any)}
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
            {isMutating ? "Creando..." : "Crear Descuento"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function RouteComponent() {
  const [_page, _setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data, isLoading, error, mutate } = useGetV1Discounts({
    swr: {
      keepPreviousData: true,
      revalidateOnFocus: false,
    },
  });

  const discounts = useMemo(() => {
    return data?.status === 200 ? data.data : [];
  }, [data]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de eliminar este descuento?")) return;
    try {
      const result = await deleteV1DiscountsId(id);
      if (result.status === 202) {
        toast.success("Descuento eliminado");
        mutate();
      } else {
        toast.error("Error al eliminar");
      }
    } catch (_e) {
      toast.error("Error del servidor");
    }
  };

  const table = useReactTable({
    data: discounts,
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

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Error al cargar descuentos
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
                Descuentos
              </h1>
              <p className="font-body text-text-main/60">
                Gestiona tus promociones y códigos de descuento
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Nuevo Descuento</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(232,213,213,0.3)] overflow-hidden">
            {isLoading ? (
              <div className="p-24 text-center text-text-main/60 animate-pulse">
                Cargando descuentos...
              </div>
            ) : discounts.length === 0 ? (
              <div className="p-24 text-center text-text-main/60">
                No hay descuentos creados aún
              </div>
            ) : (
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
                            {flexRender(
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
                        onClick={() => {
                          window.location.href = `/admin/discounts/${row.original.id}`;
                        }}
                        className="cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-6 py-4">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <DiscountFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={mutate}
      />
    </div>
  );
}
