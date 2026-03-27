import { createFileRoute } from "@tanstack/react-router";
import { BranchCard } from "../../../features/admin/components/branch-card";

export const Route = createFileRoute("/admin/branches/$branchId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { branchId } = Route.useParams();
  return <div className="px-4 py-8 max-w-sm mx-auto">dajkshfkjs</div>;
}
