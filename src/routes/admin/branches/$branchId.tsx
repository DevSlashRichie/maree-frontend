import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Clock, Calendar, Globe } from "lucide-react";
import { useGetV1BranchesId } from "@/lib/api";

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

function RouteComponent() {
  const { branchId } = Route.useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useGetV1BranchesId(branchId);

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
        className="flex items-center gap-2 text-sm font-body text-text-main/50
          hover:text-text-main transition-colors duration-150 mb-10"
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
          <span className="font-body text-[10px] font-bold uppercase tracking-widest
            border border-pink-powder text-accent px-3 py-1 rounded-full">
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
    </div>
  );
}