interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export function ProgressBar({ current, total, label }: ProgressBarProps) {
  const percentage = (current / total) * 100;

  return (
    <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm border border-accent/20 dark:border-charcoal flex flex-col gap-5">
      <div className="flex justify-between items-start">
        <h3 className="font-display text-xl text-charcoal dark:text-gray-200">
          Progreso para tu siguiente Recompensa
        </h3>
        <div className="flex flex-col text-xs text-right">
          <span className="text-primary font-bold">
            <span>{current}</span>
            <span className="text-gray-400 font-normal">/{total}</span>
          </span>
          <span className="text-gray-400">visitas</span>
        </div>
      </div>
      <div className="relative h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {label && (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-left">
          {label}
        </p>
      )}
    </div>
  );
}
