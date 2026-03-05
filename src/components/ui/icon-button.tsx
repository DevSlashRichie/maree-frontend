export function IconButton({ icon, onClick, badge }: { icon: string, onClick?: () => void, badge?: boolean }) {
  return (
    <button onClick={onClick} className="relative p-2 rounded-full hover:bg-secondary/50 transition-colors text-text-main dark:text-text-light">
      <span className="material-icons">{icon}</span>
      {badge && <span className="absolute top-1 right-1 w-2 h-2 bg-pink-soft rounded-full"></span>}
    </button>
  );
}