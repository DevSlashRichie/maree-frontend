import { createFileRoute } from "@tanstack/react-router";
import { ReportsCharts } from "@/features/report";
import { useGetV1Reports } from "@/lib/api";
import type { GetV1Reports200 } from "@/lib/schemas";

export const Route = createFileRoute("/admin/reports")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isLoading } = useGetV1Reports();
  const reportsData =
    data?.status === 200 ? (data.data as GetV1Reports200) : null;

  const weeklySalesData = reportsData
    ? [
        {
          id: "Ventas",
          color: "#5e6c75",
          data: reportsData.weeklyOrders.map(
            (item: { day: string; total: number }) => ({
              x: item.day,
              y: item.total,
            }),
          ),
        },
      ]
    : [];

  const topProductsData = reportsData
    ? reportsData.topProducts.map(
        (item: { productName: string; quantity: number }) => ({
          producto: item.productName,
          ventas: item.quantity,
        }),
      )
    : [];

  const categoryData = reportsData
    ? reportsData.categoryConsumption.map(
        (item: { category: string; total: number }, index: number) => ({
          id: item.category,
          value: item.total,
          color: ["#5e6c75", "#e8d5d5", "#3a4042", "#f2e4e4"][index % 4],
        }),
      )
    : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="font-display text-4xl text-text-main font-bold mb-2 uppercase tracking-wide">
              Reportes
            </h1>
            <p className="font-body text-text-main/60 mb-8">
              Cargando datos...
            </p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background-light">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display text-4xl text-text-main font-bold mb-2 uppercase tracking-wide">
            Reportes
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
