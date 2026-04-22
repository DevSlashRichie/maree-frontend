import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react";
import { Link, useLocation, useRouter } from "@tanstack/react-router";
import { ChevronDown, LogOut, Menu, X } from "lucide-react";
import { Fragment, useState } from "react";
import { useAuthStore } from "@/hooks/use-auth-store";
import { postAuthLogout } from "@/lib/api";

const adminNavItems = [
  { to: "/admin", label: "Dashboard", icon: "dashboard" },
  {
    to: "/admin/inventory/categories",
    label: "Inventario",
    icon: "inventory_2",
  },
  {
    to: "/admin/create-product",
    label: "Crear Producto",
    icon: "add_shopping_cart",
  },
  { to: "/admin/users", label: "Usuarios", icon: "person" },
  { to: "/admin/staff", label: "Staff", icon: "group" },
  { to: "/admin/branches", label: "Sucursales", icon: "store" },
  { to: "/admin/rewards", label: "Recompensas", icon: "card_giftcard" },
  { to: "/admin/reports", label: "Reportes", icon: "bar_chart" },
];

export function AdminNavbar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const router = useRouter();
  const { actor, clearAuth } = useAuthStore();
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    clearAuth();
    try {
      await postAuthLogout();
    } catch (err) {
      console.error("Logout failed", err);
    }
    router.navigate({ to: "/" });
  };

  return (
    <aside
      className={`
        bg-white border-r border-secondary/20 flex flex-col overflow-y-auto
        transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-20" : "w-64"}
      `}
    >
      <div>
        <div
          className={`flex items-center justify-between p-4 ${
            isCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!isCollapsed && (
            <Link to="/admin" className="flex items-center gap-2">
              <img src="/logo.png" alt="Maree" className="h-8" />
            </Link>
          )}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-full hover:bg-secondary/10"
          >
            {isCollapsed ? <Menu /> : <X />}
          </button>
        </div>

        <div className="px-4 pb-2 space-y-3">
          <Popover className="relative">
            {({ open }) => (
              <>
                <PopoverButton
                  className={`
                    w-full flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm
                    font-medium transition-all duration-200 outline-none cursor-pointer
                    ${
                      open
                        ? "bg-text-main text-white border-text-main"
                        : "bg-transparent text-text-main border-text-main/30 hover:border-text-main"
                    }
                    ${isCollapsed ? "justify-center" : ""}
                  `}
                >
                  {!isCollapsed && (
                    <span className="max-w-[120px] truncate">
                      {actor?.firstName} {actor?.lastName}
                    </span>
                  )}
                  <ChevronDown
                    className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </PopoverButton>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 translate-y-1 scale-95"
                  enterTo="opacity-100 translate-y-0 scale-100"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0 scale-100"
                  leaveTo="opacity-0 translate-y-1 scale-95"
                >
                  <PopoverPanel className="absolute left-0 mt-2 w-56 z-50 origin-top-left">
                    <div className="rounded-2xl shadow-xl border border-secondary/20 bg-white overflow-hidden">
                      <div className="flex items-center gap-3 px-4 py-3 border-b border-secondary/10 bg-secondary/5">
                        <div className="w-7 h-7 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[18px] text-secondary">
                            shield_person
                          </span>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-bold text-secondary/50">
                            Rol
                          </p>
                          <p className="text-sm font-medium text-text-main capitalize">
                            {actor?.role?.replace(/_/g, " ")}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer
                          hover:bg-red-50 transition-colors duration-150 group"
                      >
                        <div className="w-7 h-7 rounded-full bg-red-100 group-hover:bg-red-200 flex items-center justify-center shrink-0">
                          <LogOut className="w-3.5 h-3.5 text-red-500" />
                        </div>
                        <p className="text-sm font-semibold text-red-500">
                          Cerrar sesión
                        </p>
                      </button>
                    </div>
                  </PopoverPanel>
                </Transition>
              </>
            )}
          </Popover>
        </div>

        <nav className="flex flex-col gap-2 p-4">
          {adminNavItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              style={isActive(item.to) ? { backgroundColor: "#C4919A" } : {}}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                isActive(item.to)
                  ? "text-white"
                  : "text-text-main/60 hover:bg-secondary/10 hover:text-text-main"
              } ${isCollapsed ? "justify-center" : ""}`}
            >
              <span className="material-symbols-outlined text-[22px]">
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
