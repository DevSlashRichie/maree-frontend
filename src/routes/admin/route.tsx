import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminNavbar } from "@/features/admin/components/admin-navbar";
import { requireAuth } from "@/hooks/with-auth";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    await requireAuth({ location, navigateTo: "/login" });
  },
  pendingComponent: () => (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg text-muted-foreground">Loading...</p>
    </div>
  ),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <AdminNavbar />
      <Outlet />
    </>
  );
}
