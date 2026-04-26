import { Link } from "@tanstack/react-router";
import { useCartStore } from "@/hooks/use-cart-store";

export function Nav() {
  const cartItems = useCartStore((s) => s.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-pink-soft/20 py-3 px-6 z-50">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        <Link
          to="/menu"
          activeProps={{ className: "text-accent font-bold" }}
          inactiveProps={{ className: "text-text-main/40" }}
          className="flex flex-col items-center transition-all duration-300 group"
        >
          <span className="material-symbols-outlined text-[22px] mb-1 group-hover:scale-110 transition-transform">
            restaurant_menu
          </span>
          <span className="text-[9px] uppercase tracking-[0.2em]">Menú</span>
        </Link>

        <Link
          to="/order"
          activeProps={{ className: "text-accent font-bold" }}
          inactiveProps={{ className: "text-text-main/40" }}
          className="flex flex-col items-center transition-all duration-300 group"
        >
          <span className="material-symbols-outlined text-[22px] mb-1 group-hover:scale-110 transition-transform">
            shopping_bag
          </span>
          <span className="text-[9px] uppercase tracking-[0.2em]">Order</span>
        </Link>

        <Link
          to="/cart"
          activeProps={{ className: "text-accent font-bold" }}
          inactiveProps={{ className: "text-text-main/40" }}
          className="flex flex-col items-center transition-all duration-300 group"
        >
          <span className="relative mb-1">
            <span className="material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform block">
              shopping_cart
            </span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-[3px] leading-none">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </span>
          <span className="text-[9px] uppercase tracking-[0.2em]">Carrito</span>
        </Link>

        <Link
          to="/loyalty"
          activeProps={{ className: "text-accent font-bold" }}
          inactiveProps={{ className: "text-text-main/40" }}
          className="flex flex-col items-center transition-all duration-300 group"
        >
          <span className="material-symbols-outlined text-[22px] mb-1 group-hover:scale-110 transition-transform">
            wallet
          </span>
          <span className="text-[9px] uppercase tracking-[0.2em]">Loyalty</span>
        </Link>

        <Link
          to="/profile"
          activeProps={{ className: "text-accent font-bold" }}
          inactiveProps={{ className: "text-text-main/40" }}
          className="flex flex-col items-center transition-all duration-300 group"
        >
          <span className="material-symbols-outlined text-[22px] mb-1 group-hover:scale-110 transition-transform">
            person
          </span>
          <span className="text-[9px] uppercase tracking-[0.2em]">Perfil</span>
        </Link>

        <Link
          to="/admin"
          activeProps={{ className: "text-accent font-bold" }}
          inactiveProps={{ className: "text-text-main/40" }}
          className="flex flex-col items-center transition-all duration-300 group"
        >
          <span className="material-symbols-outlined text-[22px] mb-1 group-hover:scale-110 transition-transform">
            shield_person
          </span>
          <span className="text-[9px] uppercase tracking-[0.2em]">Admin</span>
        </Link>
      </div>
    </nav>
  );
}
