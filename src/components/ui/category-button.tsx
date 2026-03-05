interface CategoryButtonProps {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

export function CategoryButton({ label, isActive, onClick }: CategoryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`snap-start shrink-0 px-8 py-3 rounded-full font-medium text-sm tracking-widest uppercase transition-all duration-300 ${
        isActive
          ? "bg-accent text-white border border-pink-soft shadow-[0_0_15px_rgba(232,213,213,0.5)] scale-105"
          : "bg-secondary/30 text-text-main hover:bg-pink-soft/30"
      }`}
    >
      {label}
    </button>
  );
}