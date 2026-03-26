import { Link } from "@tanstack/react-router";

export function Nav() {
  const navItems = [
    { to: "/menu", label: "Menú", icon: "restaurant_menu" },
    { to: "/order", label: "Order", icon: "shopping_bag" },
    { to: "/loyalty", label: "Loyalty", icon: "wallet" },
    {
      to: "/admin",
      label: "Admin",
      icon: "shield_person",
      permission: "panel:access",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-pink-soft/20 py-3 px-6 z-50">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeProps={{ className: "text-accent font-bold" }}
            inactiveProps={{ className: "text-text-main/40" }}
            className="flex flex-col items-center transition-all duration-300 group"
          >
            <span className="material-symbols-outlined text-[22px] mb-1 group-hover:scale-110 transition-transform">
              {item.icon}
            </span>
            <span className="text-[9px] uppercase tracking-[0.2em]">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
