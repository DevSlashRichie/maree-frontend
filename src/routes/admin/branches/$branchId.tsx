import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Globe,
  MapPin,
  Pencil,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/modal";
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
                id={`weekday-${s.id}`}
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
                id={`from-${s.id}`}
                type="time"
                value={s.fromTime}
                onChange={(e) =>
                  updateSchedule(s.id, "fromTime", e.target.value)
                }
                className="text-sm border rounded-lg px-2 py-1"
              />

              <input
                id={`to-${s.id}`}
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
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-main/40 text-sm font-body">
          Cargando sucursal...
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

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <button
        type="button"
        onClick={() => navigate({ to: "/admin/branches" })}
        className="flex items-center gap-2 px-5 py-2 rounded-full 
            bg-[#2F3437] text-white
            text-xs font-bold uppercase mb-15"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a sucursales
      </button>

      <div
        className="bg-white rounded-t-[50%] rounded-b-3xl shadow-[0_4px_20px_rgba(232,213,213,0.3)]
          border border-pink-powder p-4 relative mt-12 mb-6"
      >
        <div className="relative h-32 -mt-16 arched-img shadow-inner border-4 border-white z-10 bg-secondary/20 flex items-center justify-center">
          <MapPin className="w-10 h-10 text-secondary/60" />
        </div>

        <div className="pt-6 pb-2 text-center bg-white rounded-b-3xl">
          <h1 className="font-display text-2xl text-text-main font-bold uppercase tracking-wide mb-1">
            {branch.name}
          </h1>
          <span className="block font-body text-sm text-accent font-bold tracking-widest uppercase mb-2">
            {branch.state}
          </span>
          <p className="font-body text-[11px] text-text-main/30">
            Creada el{" "}
            {new Date(branch.createdAt).toLocaleDateString("es-MX", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#2F3437] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#2F3437]/90 transition-colors"
          >
            <Pencil className="w-3 h-3" />
            Editar
          </button>
        </div>
      </div>

      <div
        className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(232,213,213,0.3)]
          border border-pink-powder p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-base font-bold text-text-main uppercase tracking-wide">
            Horarios
          </h2>
          <span
            className="font-body text-[10px] font-bold uppercase tracking-widest
            border border-pink-powder text-accent px-3 py-1 rounded-full"
          >
            {schedules.length} horario{schedules.length !== 1 ? "s" : ""}
          </span>
        </div>

        {schedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-pink-powder rounded-2xl">
            <Clock className="w-6 h-6 text-text-main/20 mb-2" />
            <p className="font-body text-text-main/40 text-sm">
              Sin horarios registrados
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {Object.entries(schedulesByDay)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([day, daySchedules]) => (
                <div
                  key={day}
                  className="flex items-start gap-4 px-4 py-3 rounded-2xl bg-secondary/5
                    border border-pink-powder/50"
                >
                  <div className="flex items-center gap-2 w-28 shrink-0 pt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span className="font-body text-sm font-bold text-text-main">
                      {WEEKDAYS[Number(day)]}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    {daySchedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="flex items-center gap-3"
                      >
                        <Clock className="w-3.5 h-3.5 shrink-0 text-text-main/30" />
                        <span className="font-body text-sm text-text-main/70">
                          {schedule.fromTime} – {schedule.toTime}
                        </span>
                        <div className="flex items-center gap-1 ml-auto">
                          <Globe className="w-3 h-3 text-text-main/30" />
                          <span className="font-body text-xs text-text-main/30">
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
