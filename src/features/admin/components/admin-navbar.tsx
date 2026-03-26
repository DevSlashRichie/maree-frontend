import { Link, useLocation } from "@tanstack/react-router";
import { BranchSelector } from "../components/selector-branch";

const adminNavItems = [
  { to: "/admin", label: "Dashboard", icon: "dashboard" },
  { to: "/admin/rewards", label: "Recompensas", icon: "card_giftcard" },
  { to: "/admin/reports", label: "Reportes", icon: "bar_chart" },
];

export function AdminNavbar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="bg-white border-b border-secondary/20">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center px-4 py-3">
        <div />

        <nav className="flex items-center gap-2">
          {adminNavItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                isActive(item.to)
                  ? "bg-secondary text-white"
                  : "text-text-main/60 hover:bg-secondary/10 hover:text-text-main"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {item.icon}
              </span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="flex justify-end">
          <BranchSelector />
        </div>
      </div>
    </div>
  );
}