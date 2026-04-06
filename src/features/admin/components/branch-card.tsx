import { useNavigate } from "@tanstack/react-router";
import { Calendar, Clock, MapPin } from "lucide-react";
import type { GetV1Branches200Item } from "../../../lib/schemas";

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

interface BranchCardProps {
  branch: GetV1Branches200Item;
}

export function BranchCard({ branch }: BranchCardProps) {
  const navigate = useNavigate();
  const schedules = branch.schedulesTable ?? [];

  return (
    <button
      type="button"
      className="group text-left w-full bg-white rounded-t-[50%] rounded-b-3xl shadow-[0_4px_20px_rgba(232,213,213,0.3)]
        border border-pink-powder p-4 relative mt-12 transition-all
        hover:shadow-[0_8px_30px_rgba(232,213,213,0.5)] cursor-pointer"
      onClick={() =>
        navigate({
          to: "/admin/branches/$branchId",
          params: { branchId: branch.id },
        })
      }
    >
      <div className="relative h-32 -mt-16 arched-img shadow-inner border-4 border-white z-10 bg-secondary/20 flex items-center justify-center">
        <MapPin className="w-10 h-10 text-secondary/60" />
      </div>

      <div className="pt-6 pb-4 text-center bg-white rounded-b-3xl">
        <h3 className="font-display text-xl text-text-main font-bold mb-1 uppercase tracking-wide">
          {branch.name}
        </h3>
        <span className="block font-body text-sm text-accent font-bold mb-4 tracking-widest uppercase">
          {branch.state}
        </span>

        <div className="px-4 mb-6 min-h-[72px]">
          {schedules.length === 0 ? (
            <p className="text-xs text-text-main/30 italic">
              Sin horarios registrados
            </p>
          ) : (
            <div className="space-y-1.5">
              {schedules.slice(0, 3).map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center justify-center gap-2 text-xs text-text-main/60"
                >
                  <Calendar className="w-3 h-3 shrink-0" />
                  <span className="font-semibold">
                    {WEEKDAYS[schedule.weekday]}
                  </span>
                  <Clock className="w-3 h-3 shrink-0" />
                  <span>
                    {schedule.fromTime} – {schedule.toTime}
                  </span>
                </div>
              ))}
              {schedules.length > 3 && (
                <p className="text-[11px] text-text-main/30">
                  +{schedules.length - 3} más
                </p>
              )}
            </div>
          )}
        </div>

        <span
          className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-secondary text-white
            text-xs font-bold tracking-widest uppercase group-hover:bg-secondary/90
            transition-colors duration-150"
        >
          Ver detalle
        </span>
      </div>
    </button>
  );
}
