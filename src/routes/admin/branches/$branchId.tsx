import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Globe,
  MapPin,
  Pencil,
  Users,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/modal";
import { useBranchStore } from "@/hooks/use-branch-store";
import { useGetV1BranchesId, usePatchV1BranchesId } from "@/lib/api";

export const Route = createFileRoute("/admin/branches/$branchId")({
  component: RouteComponent,
});

const WEEKDAYS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

const generateId = () => crypto.randomUUID();

type Schedule = {
  id: string;
  weekday: number;
  fromTime: string;
  toTime: string;
  timezone: string;
};

function EditBranchModal({
  isOpen,
  onClose,
  branchId,
  initialName,
  initialState,
  initialSchedules,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  branchId: string;
  initialName: string;
  initialState: string;
  initialSchedules: Schedule[];
  onSuccess: () => void;
}) {
  const { trigger: patchBranch, isMutating } = usePatchV1BranchesId(branchId);

  const [form, setForm] = useState({
    name: initialName,
    state: initialState,
    schedules: initialSchedules.map((s) => ({ ...s })),
  });
  const [error, setError] = useState<string | null>(null);

  const addSchedule = () => {
    setForm({
      ...form,
      schedules: [
        ...form.schedules,
        {
          id: generateId(),
          weekday: 1,
          fromTime: "",
          toTime: "",
          timezone: "America/Mexico_City",
        },
      ],
    });
  };

  const updateSchedule = (
    id: string,
    field: keyof Omit<Schedule, "id">,
    value: string | number,
  ) => {
    setForm({
      ...form,
      schedules: form.schedules.map((s) =>
        s.id === id ? { ...s, [field]: value } : s,
      ),
    });
  };

  const removeSchedule = (id: string) => {
    setForm({
      ...form,
      schedules: form.schedules.filter((s) => s.id !== id),
    });
  };

  const handleSubmit = async () => {
    setError(null);

    if (!form.name || !form.state) {
      setError("Completa todos los campos");
      return;
    }

    const result = await patchBranch({
      name: form.name,
      state: form.state as "active" | "inactive",
      schedules: form.schedules.map(({ id, ...rest }) => rest),
    });

    if (result.status === 200) {
      toast.success("Sucursal actualizada");
      onSuccess();
      onClose();
      return;
    }

    if (result.status === 404) {
      setError("Sucursal no encontrada");
      return;
    }

    setError("Error inesperado al guardar");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar sucursal"
      description="Actualiza los datos de la sucursal"
      maxWidth="md"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="branch-name"
            className="text-[10px] uppercase tracking-[0.15em] text-text-main/40 font-semibold"
          >
            Nombre
          </label>
          <input
            id="branch-name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="px-4 py-2.5 rounded-xl border border-secondary/20 text-sm font-semibold text-text-main outline-none focus:border-secondary"
            placeholder="Sucursal Centro"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="branch-state"
            className="text-[10px] uppercase tracking-[0.15em] text-text-main/40 font-semibold"
          >
            Estado
          </label>
          <select
            id="branch-state"
            value={form.state === "active" ? "open" : "close"}
            onChange={(e) =>
              setForm({
                ...form,
                state: e.target.value === "open" ? "active" : "inactive",
              })
            }
            className="px-4 py-2.5 rounded-xl border border-secondary/20 text-sm font-semibold text-text-main outline-none focus:border-secondary"
          >
            <option value="open">Open</option>
            <option value="close">Close</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <p className="text-[10px] uppercase tracking-[0.15em] text-text-main/40 font-semibold">
              Horarios
            </p>
            <button
              type="button"
              onClick={addSchedule}
              className="text-xs font-bold text-secondary"
            >
              + Agregar
            </button>
          </div>

          {form.schedules.length === 0 && (
            <p className="text-xs text-text-main/40">Sin horarios</p>
          )}

          {form.schedules.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-2 p-2 rounded-xl border border-secondary/10"
            >
              <select
                value={s.weekday}
                onChange={(e) =>
                  updateSchedule(s.id, "weekday", Number(e.target.value))
                }
                className="text-sm border rounded-lg px-2 py-1"
              >
                {WEEKDAYS.map((day, index) => (
                  <option key={day} value={index}>
                    {day}
                  </option>
                ))}
              </select>

              <input
                type="time"
                value={s.fromTime}
                onChange={(e) =>
                  updateSchedule(s.id, "fromTime", e.target.value)
                }
                className="text-sm border rounded-lg px-2 py-1"
              />

              <input
                type="time"
                value={s.toTime}
                onChange={(e) => updateSchedule(s.id, "toTime", e.target.value)}
                className="text-sm border rounded-lg px-2 py-1"
              />

              <button
                type="button"
                onClick={() => removeSchedule(s.id)}
                className="text-xs text-red-500 font-bold"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}

        <div className="flex justify-end gap-3 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-text-main/50"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isMutating}
            onClick={handleSubmit}
            className="px-6 py-2 rounded-full bg-[#2F3437] text-white text-xs font-bold tracking-widest uppercase disabled:opacity-50"
          >
            {isMutating ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function RouteComponent() {
  const { branchId } = Route.useParams();
  const navigate = useNavigate();
  const { data, isLoading, mutate } = useGetV1BranchesId(branchId);
  const { setSelectedBranch } = useBranchStore();
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-main/40 text-sm">Cargando sucursal...</p>
      </div>
    );
  }

  if (!data || data.status !== 200) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-accent text-sm">{data?.data.message}</p>
      </div>
    );
  }

  const branch = data.data;
  const schedules = branch.schedulesTable ?? [];

  const schedulesByDay = schedules.reduce(
    (acc, schedule) => {
      const day = schedule.weekday;
      if (!acc[day]) acc[day] = [];
      acc[day].push(schedule);
      return acc;
    },
    {} as Record<number, typeof schedules>,
  );

  // Derive initials from branch name
  const initials = branch.name
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase() ?? "")
    .join("");

  const isActive = branch.state === "active";

  return (
    <div className="min-h-screen bg-[#F0EDE8] p-8">
      {/* Top nav row */}
      <div className="flex items-center justify-between mb-8 max-w-4xl mx-auto">
        <button
          type="button"
          onClick={() => navigate({ to: "/admin/branches" })}
          className="flex items-center gap-2 text-sm text-text-main/60 hover:text-text-main transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al listado
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedBranch({
              id: branch.id,
              name: branch.name,
              state: branch.state,
            });
            navigate({ to: "/admin/staff" });
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#2F3437] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#2F3437]/90 transition-colors"
        >
          <Users className="w-3.5 h-3.5" />
          Ver staff
        </button>
      </div>

      {/* Two-column layout */}
      <div className="max-w-4xl mx-auto flex gap-4 items-start">
        {/* Left card — identity */}
        <div className="w-64 shrink-0 bg-white rounded-2xl border border-black/[0.06] p-6 flex flex-col items-center gap-3">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-[#E8E4DF] flex items-center justify-center">
            <span className="text-2xl font-bold text-text-main/60 tracking-tight">
              {initials || <MapPin className="w-8 h-8 text-text-main/40" />}
            </span>
          </div>

          <div className="text-center">
            <h1 className="text-base font-bold text-text-main leading-tight">
              {branch.name}
            </h1>
            <span
              className={`inline-block mt-1.5 px-3 py-0.5 rounded-full text-xs font-medium ${
                isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {isActive ? "Activa" : "Inactiva"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="w-full mt-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#2F3437] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#2F3437]/90 transition-colors"
          >
            <Pencil className="w-3 h-3" />
            Editar
          </button>
        </div>

        {/* Right card — details */}
        <div className="flex-1 bg-white rounded-2xl border border-black/[0.06] overflow-hidden">
          {/* Created at row */}
          <div className="flex items-start gap-4 px-6 py-5 border-b border-black/[0.06]">
            <Calendar className="w-4 h-4 text-text-main/30 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-text-main/40 mb-0.5">
                Fecha de creación
              </p>
              <p className="text-sm font-medium text-text-main">
                {new Date(branch.createdAt).toLocaleDateString("es-MX", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Schedules section */}
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-text-main/30" />
                <p className="text-xs text-text-main/40">Horarios</p>
              </div>
              <span className="text-xs text-text-main/40 font-medium">
                {schedules.length} horario{schedules.length !== 1 ? "s" : ""}
              </span>
            </div>

            {schedules.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-20 rounded-xl border border-dashed border-black/10">
                <p className="text-sm text-text-main/30">
                  Sin horarios registrados
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {Object.entries(schedulesByDay)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([day, daySchedules]) => (
                    <div
                      key={day}
                      className="flex items-start gap-4 px-4 py-3 rounded-xl bg-[#F7F5F2] border border-black/[0.04]"
                    >
                      <span className="w-24 shrink-0 text-sm font-semibold text-text-main">
                        {WEEKDAYS[Number(day)]}
                      </span>
                      <div className="flex flex-col gap-1 flex-1">
                        {daySchedules.map((schedule) => (
                          <div
                            key={schedule.id}
                            className="flex items-center gap-3"
                          >
                            <span className="text-sm text-text-main/70">
                              {schedule.fromTime} – {schedule.toTime}
                            </span>
                            <div className="flex items-center gap-1 ml-auto">
                              <Globe className="w-3 h-3 text-text-main/25" />
                              <span className="text-xs text-text-main/30">
                                {schedule.timezone}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <EditBranchModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        branchId={branchId}
        initialName={branch.name}
        initialState={branch.state}
        initialSchedules={schedules.map((s) => ({
          id: s.id,
          weekday: s.weekday,
          fromTime: s.fromTime,
          toTime: s.toTime,
          timezone: s.timezone,
        }))}
        onSuccess={() => mutate()}
      />
    </div>
  );
}
