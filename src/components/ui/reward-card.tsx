import type { LucideIcon } from "lucide-react";

interface RewardCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  isAvailable: boolean;
  points?: number;
  onRedeem?: () => void;
}

export function RewardCard({
  title,
  description,
  icon: Icon,
  isAvailable,
  points,
  onRedeem,
}: RewardCardProps) {
  return (
    <div
      className={`bg-card-light p-5 rounded-xl border border-accent/30 hover:shadow-md transition-shadow group cursor-pointer ${
        !isAvailable ? "opacity-75" : ""
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div
          className={`p-3 rounded-full ${
            isAvailable
              ? "bg-secondary/20 text-charcoal"
              : "bg-primary/20 text-primary"
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
        {isAvailable ? (
          <span className="text-[10px] bg-green-100 text-green-800 px-2 py-1 rounded-full font-bold uppercase tracking-wider">
            Disponible
          </span>
        ) : (
          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-bold uppercase tracking-wider">
            {points} Visitas
          </span>
        )}
      </div>
      <h4 className="font-display text-lg text-charcoal mb-1">{title}</h4>
      <p className="text-xs text-gray-500 mb-4 line-clamp-2">{description}</p>
      {isAvailable ? (
        <button
          type="button"
          onClick={onRedeem}
          className="w-full py-2 bg-accent/20 text-charcoal rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-accent hover:text-white transition-all"
        >
          Canjear
        </button>
      ) : (
        <button
          type="button"
          disabled
          className="w-full py-2 bg-gray-100 text-gray-400 rounded-lg text-xs font-bold uppercase tracking-widest cursor-not-allowed"
        >
          Faltan Puntos
        </button>
      )}
    </div>
  );
}
