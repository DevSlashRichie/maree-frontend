import { Cake, CheckCircle } from "lucide-react";

interface HistoryItemProps {
  title: string;
  location: string;
  date: string;
  status: string;
}

export function HistoryItem({
  title,
  location,
  date,
  status,
}: HistoryItemProps) {
  const isRedeemed =
    status.toLowerCase() === "completado" ||
    status.toLowerCase() === "canjeado";

  return (
    <li className="p-4 hover:bg-background-light dark:hover:bg-background-dark/50 transition-colors flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div
          className={`h-10 w-10 rounded-full flex items-center justify-center ${
            isRedeemed
              ? "bg-accent/20 text-charcoal dark:text-accent"
              : "bg-secondary/30 text-charcoal dark:text-white"
          }`}
        >
          {isRedeemed ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <Cake className="w-5 h-5" />
          )}
        </div>
        <div>
          <p className="font-bold text-sm text-charcoal dark:text-gray-200">
            {title}
          </p>
          <p className="text-xs text-gray-500">{location}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs font-mono text-gray-600 dark:text-gray-400">
          {/* Opcional: formatear la fecha aquí si viene como ISOString */}
          {new Date(date).toLocaleDateString()}
        </p>
        <p
          className={`text-[10px] uppercase tracking-wide font-bold ${
            isRedeemed ? "text-green-600 dark:text-green-400" : "text-secondary"
          }`}
        >
          {status}
        </p>
      </div>
    </li>
  );
}
