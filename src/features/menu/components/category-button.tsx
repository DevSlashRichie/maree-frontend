interface CategoryButtonProps {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

export function CategoryButton({
  label,
  isActive,
  onClick,
}: CategoryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`snap-start shrink-0 px-6 py-2 rounded-full font-medium text-xs tracking-widest uppercase transition-all duration-300 ${
        isActive
          ? "bg-accent text-white border border-pink-soft shadow-[0_4px_12px_rgba(232,213,213,0.4)] scale-105"
          : "bg-secondary/20 text-text-main/70 hover:bg-pink-soft/30"
      }`}
    >
      {label}
    </button>
  );
}
