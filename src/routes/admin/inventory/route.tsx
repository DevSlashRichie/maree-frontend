import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router";

export const Route = createFileRoute("/admin/inventory")({
  component: InventoryLayout,
});

function InventoryLayout() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const tabs = [
    { name: "Categorías", to: "/admin/inventory/categories" },
    { name: "Productos", to: "/admin/inventory/products" },
  ];

  return (
    <div className="min-h-screen bg-background-light">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4 border-b border-secondary/10 pb-4">
              {tabs.map((tab) => (
                <Link
                  key={tab.to}
                  to={tab.to}
                  className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                    isActive(tab.to)
                      ? "text-[#C4919A]"
                      : "text-text-main/60 hover:text-text-main"
                  }`}
                >
                  {tab.name}
                  {isActive(tab.to) && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C4919A]" />
                  )}
                </Link>
              ))}
            </div>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
