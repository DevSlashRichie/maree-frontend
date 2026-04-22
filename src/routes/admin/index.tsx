import { createFileRoute } from "@tanstack/react-router";
import { ReportsCharts } from "@/features/report";

export const Route = createFileRoute("/admin/")({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="min-h-screen bg-background-light">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display text-4xl text-text-main font-bold mb-2 uppercase tracking-wide">
            Dashboard
          </h1>
          <p className="font-body text-text-main/60 mb-8">
            Vista general del rendimiento de la cafetería
          </p>
          <ReportsCharts />
        </div>
      </div>
    </div>
  );
}
