import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminNavbar } from "@/features/admin/components/admin-navbar";
import { withAuth } from "@/hooks/use-with-auth";

export const Route = createFileRoute("/admin")({
  component: withAuth(RouteComponent, "/login"),
});

function RouteComponent() {
  return (
    <>
      <AdminNavbar />
      <Outlet />
    </>
  );
}
