import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminNavbar } from "@/components/admin/admin-navbar";

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
