import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react";
import { Link, useLocation, useRouter } from "@tanstack/react-router";
import { ChevronDown, LogOut } from "lucide-react";
import { Fragment } from "react";
import { useAuthStore } from "@/hooks/use-auth-store";
import { postAuthLogout } from "@/lib/api";
import { BranchSelector } from "../components/selector-branch";

const adminNavItems = [
  { to: "/admin", label: "Dashboard", icon: "dashboard" },
  { to: "/admin/users", label: "Usuarios", icon: "person" },
  { to: "/admin/staff", label: "Staff", icon: "group" },
  { to: "/admin/rewards", label: "Recompensas", icon: "card_giftcard" },
  { to: "/admin/reports", label: "Reportes", icon: "bar_chart" },
];

export function AdminNavbar() {
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
    <div className="bg-white border-b border-secondary/20">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center px-4 py-3">
        <div className="flex justify-start">
          <Popover className="relative">
            {({ open }) => (
              <>
                <PopoverButton
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm
                    font-medium transition-all duration-200 outline-none cursor-pointer
                    ${
                      open
                        ? "bg-text-main text-white border-text-main"
                        : "bg-transparent text-text-main border-text-main/30 hover:border-text-main"
                    }
                  `}
                >
                  <span className="max-w-[160px] truncate">
                    {actor?.firstName} {actor?.lastName}
                  </span>
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
                  <PopoverPanel className="absolute left-0 mt-2 w-48 z-50 origin-top-left">
                    <div className="rounded-2xl shadow-xl border border-secondary/20 bg-white overflow-hidden">
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
