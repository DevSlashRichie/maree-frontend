import { createFileRoute } from "@tanstack/react-router";
import { BranchesPage } from "../../features/admin/components/branch-page";

export const Route = createFileRoute("/admin/branches")({
  component: BranchesPage,
});