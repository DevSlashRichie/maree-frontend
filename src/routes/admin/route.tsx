import { AdminNavbar } from "@/components/internal/admin/admin-navbar";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
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
