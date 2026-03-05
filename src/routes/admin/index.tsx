import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/")({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="min-h-screen bg-background-light">
      <div className="p-6">
        <Outlet />
      </div>
    </div>
  );
}
