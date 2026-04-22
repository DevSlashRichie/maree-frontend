import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/")({
  component: AdminLayout,

  beforeLoad: () => {
    throw redirect({
      to: "/admin/reports",
    });
  },
});

function AdminLayout() {
  return <div className="min-h-screen bg-background-light"></div>;
}
