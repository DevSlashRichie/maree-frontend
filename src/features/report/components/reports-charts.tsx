import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import { ResponsivePie } from "@nivo/pie";

import { useGetV1Reports } from "@/lib/api";
import type { GetV1Reports200 } from "@/lib/schemas";

export function ReportsCharts() {
  const { data, isLoading } = useGetV1Reports();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light">
        <p className="font-body text-text-main/60 mb-8">Cargando datos...</p>
      </div>
    );
  }

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(232,213,213,0.3)]">
        <h2 className="font-display text-xl text-text-main font-bold mb-4">
          Ordenes Semanales
        </h2>
        <div className="h-80">
          <ResponsiveLine
            data={weeklySalesData}
            margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
            xScale={{ type: "point" }}
            yScale={{
              type: "linear",
              min: "auto",
              max: "auto",
              stacked: false,
            }}
            curve="monotoneX"
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 0,
              tickPadding: 15,
              tickRotation: 0,
              legend: "",
            }}
            axisLeft={{
              tickSize: 0,
              tickPadding: 15,
              tickRotation: 0,
              legend: "",
              legendOffset: -40,
              legendPosition: "middle",
            }}
            enableGridX={false}
            enableGridY={true}
            colors={["#5e6c75"]}
            pointSize={10}
            pointColor="#ffffff"
            pointBorderWidth={3}
            pointBorderColor="#5e6c75"
            enableArea={true}
            areaOpacity={0.15}
            useMesh={true}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(232,213,213,0.3)]">
        <h2 className="font-display text-xl text-text-main font-bold mb-4">
          Productos Más Vendidos
        </h2>
        <div className="h-80">
          <ResponsiveBar
            data={topProductsData}
            keys={["ventas"]}
            indexBy="producto"
            margin={{ top: 20, right: 20, bottom: 50, left: 100 }}
            padding={0.4}
            layout="horizontal"
            valueScale={{ type: "linear" }}
            indexScale={{ type: "band", round: true }}
            colors={["#5e6c75"]}
            borderRadius={6}
            borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
            axisTop={null}
            axisRight={null}
            axisBottom={{ tickSize: 0, tickPadding: 10, tickRotation: 0 }}
            axisLeft={{ tickSize: 0, tickPadding: 10, tickRotation: 0 }}
            enableGridX={true}
            enableGridY={false}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor="#ffffff"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(232,213,213,0.3)] lg:col-span-2">
        <h2 className="font-display text-xl text-text-main font-bold mb-4">
          Consumo por Categoría
        </h2>
        <div className="h-80">
          <ResponsivePie
            data={categoryData}
            margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
            innerRadius={0.5}
            padAngle={2}
            cornerRadius={4}
            activeOuterRadiusOffset={8}
            colors={{ datum: "data.color" }}
            borderWidth={0}
            enableArcLinkLabels={false}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
            legends={[
              {
                anchor: "right",
                direction: "column",
                justify: false,
                translateX: 60,
                translateY: 0,
                itemsSpacing: 8,
                itemWidth: 100,
                itemHeight: 20,
                itemTextColor: "#2d2a26",
                itemDirection: "left-to-right",
                itemOpacity: 1,
                symbolSize: 16,
                symbolShape: "circle",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
