import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/branches/$branchId")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/admin/branches/$branchId"!</div>;
}
