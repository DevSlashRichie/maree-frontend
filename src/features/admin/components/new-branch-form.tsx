import { useState } from "react";
import { usePostV1Branches } from "@/lib/api";
import type { CreateBranchDto } from "@/lib/schemas/createBranchDto";
import type { PostV1Branches201 } from "@/lib/schemas/postV1Branches201";

interface Props {
  onClose: () => void;
  onSuccess?: (branch: PostV1Branches201) => void;
}

const days = [
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
};

type EditableFields = "weekday" | "fromTime" | "toTime";

export function CreateBranchForm({ onClose, onSuccess }: Props) {
  const postBranch = usePostV1Branches();

  const _createBranch = (data: CreateBranchDto) =>
    postBranch.trigger(data as CreateBranchDto);

  const isCreatingBranch = postBranch.isMutating;

  const [form, setForm] = useState<{
    name: string;
    state: string;
    schedules: Schedule[];
  }>({
    name: "",
    state: "",
    schedules: [],
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
        },
      ],
    });
  };

  const updateSchedule = <K extends EditableFields>(
    id: string,
    field: K,
    value: Schedule[K],
  ): void => {
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label
          htmlFor="name"
          className="text-[10px] uppercase tracking-[0.15em] text-text-main/40 font-semibold"
        >
          Nombre
        </label>
        <input
          id="name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="px-4 py-2.5 rounded-xl border border-secondary/20 text-sm font-semibold text-text-main outline-none focus:border-secondary"
          placeholder="Sucursal Centro"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="state"
          className="text-[10px] uppercase tracking-[0.15em] text-text-main/40 font-semibold"
        >
          Estado
        </label>
        <select
          id="state"
          value={form.state}
          onChange={(e) => setForm({ ...form, state: e.target.value })}
          className="px-4 py-2.5 rounded-xl border border-secondary/20 text-sm font-semibold text-text-main outline-none focus:border-secondary"
        >
          <option value="" disabled>
            Selecciona un estado
          </option>
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
              {days.map((day, index) => (
                <option key={day} value={index}>
                  {day}
                </option>
              ))}
            </select>

            <input
              type="time"
              value={s.fromTime}
              onChange={(e) => updateSchedule(s.id, "fromTime", e.target.value)}
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

      <div className="flex justify-end gap-3 mt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-semibold text-text-main/50"
        >
          Cancelar
        </button>

        <button
          type="button"
          disabled={isCreatingBranch}
          onClick={async () => {
            setError(null);

            if (!form.name || !form.state) {
              setError("Completa todos los campos");
              return;
            }

            const res = await postBranch.trigger({
              name: form.name,
              state: form.state === "open" ? "active" : "inactive",
              schedules: form.schedules.map(({ id, ...rest }) => ({
                ...rest,
                timezone: "America/Mexico_City",
              })),
            });

            if (res.status === 201) {
              setForm({ name: "", state: "", schedules: [] });
              onSuccess?.(res.data);
              onClose();
              return;
            }

            if (res.status === 409) {
              setError(res.data.message || "El nombre ya está en uso");
              return;
            }

            if (res.status === 500) {
              setError(res.data.message || "Error inesperado");
              return;
            }
          }}
          className="px-6 py-2 rounded-full bg-secondary text-white text-xs font-bold tracking-widest uppercase disabled:opacity-50"
        >
          {isCreatingBranch ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}
