import { createFileRoute, Link } from "@tanstack/react-router";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    AlertCircle,
    ArrowUpRight,
    Clock,
    Loader2,
    ShoppingBag,
    User,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useGetV1Orders } from "@/lib/api";
import { formatPrice } from "@/lib/money";

type OrderRow = {
    order: {
        id: string;
        userId: string;
        branchId: string;
        discountId: string | null;
        total: string;
        status: string;
        note: string | null;
        orderNumber: string;
        orderType: string;
        createdAt: string;
    };
    user?: {
        id: string;
        firstName: string;
        lastName: string;
        phone: string;
        email: string | null;
        createdAt: string;
    } | null;
};

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> =
    {
        pending: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
        confirmed: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
        preparing: {
            bg: "bg-purple-50",
            text: "text-purple-700",
            dot: "bg-purple-400",
        },
        ready: { bg: "bg-teal-50", text: "text-teal-700", dot: "bg-teal-400" },
        delivered: {
            bg: "bg-green-50",
            text: "text-green-700",
            dot: "bg-green-400",
        },
        cancelled: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-400" },
    };

function StatusBadge({ status }: { status: string }) {
    const style = STATUS_STYLES[status.toLowerCase()] ?? {
        bg: "bg-gray-50",
        text: "text-gray-600",
        dot: "bg-gray-400",
    };
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-current/10 ${style.bg} ${style.text}`}
        >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            {status}
    </span>
    );
}

export const Route = createFileRoute("/admin/orders/")({
    component: OrdersComponent,
});

const columnHelper = createColumnHelper<OrderRow>();

function OrdersComponent() {
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterType, setFilterType] = useState("all");

    const {
        data: apiResponse,
        isLoading,
        error,
    } = useGetV1Orders(undefined);

    const rows = useMemo<OrderRow[]>(() => {
        return apiResponse?.status === 200 ? apiResponse.data : [];
    }, [apiResponse]);

    const filteredData = useMemo(() => {
        return rows.filter((r) => {
            const matchStatus =
                filterStatus === "all" ||
                r.order.status.toLowerCase() === filterStatus;
            const matchType =
                filterType === "all" ||
                r.order.orderType.toLowerCase() === filterType;
            return matchStatus && matchType;
        });
    }, [rows, filterStatus, filterType]);

    const orderTypes = useMemo(() => {
        const types = new Set(rows.map((r) => r.order.orderType.toLowerCase()));
        return Array.from(types);
    }, [rows]);

    const columns = useMemo(
        () => [
            columnHelper.accessor("order.orderNumber", {
                header: "Pedido",
                cell: (info) => {
                    const num = info.getValue();
                    const short = num.substring(num.length - 6);
                    return (
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center border border-secondary/20 shrink-0">
                                <ShoppingBag className="w-4 h-4 text-secondary" />
                            </div>
                            <span className="font-mono font-semibold text-text-main text-sm">
                #{short}
              </span>
                        </div>
                    );
                },
            }),

            columnHelper.accessor("user", {
                header: "Cliente",
                cell: (info) => {
                    const user = info.getValue();
                    if (!user) {
                        return (
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                    <User className="w-3.5 h-3.5 text-text-main/40" />
                                </div>
                                <span className="text-sm font-medium text-text-main/40">
                                    Sin información
                                </span>
                            </div>
                        );
                    }
                    return (
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                <User className="w-3.5 h-3.5 text-text-main/40" />
                            </div>
                            <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-text-main truncate">
                  {user.firstName} {user.lastName}
                </span>
                                <span className="text-[11px] text-text-main/40 truncate">
                  {user.phone}
                </span>
                            </div>
                        </div>
                    );
                },
            }),

            columnHelper.accessor("order.orderType", {
                header: "Tipo",
                cell: (info) => (
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-main/60 bg-gray-100 px-2.5 py-1 rounded-lg">
            {info.getValue()}
          </span>
                ),
            }),

            columnHelper.accessor("order.createdAt", {
                header: "Fecha",
                cell: (info) => (
                    <div className="flex items-center gap-1.5 text-text-main/60">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-sm">
              {new Date(info.getValue()).toLocaleString("es-CL", {
                  dateStyle: "short",
                  timeStyle: "short",
              })}
            </span>
                    </div>
                ),
            }),

            columnHelper.accessor("order.total", {
                header: "Total",
                cell: (info) => (
                    <span className="font-semibold text-text-main text-sm">
            {formatPrice(Number(info.getValue()))}
          </span>
                ),
            }),

            columnHelper.accessor("order.status", {
                header: "Estado",
                cell: (info) => <StatusBadge status={info.getValue()} />,
            }),

            columnHelper.display({
                id: "actions",
                header: "Detalles",
                cell: (info) => (
                    <Link
                        to="/admin/orders/$orderId"
                        params={{ orderId: info.row.original.order.id }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary/5 hover:bg-secondary/10 text-secondary transition-colors text-xs font-bold"
                    >
                        Ver
                        <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                ),
            }),
        ],
        [],
    );

    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (isLoading) {
        return (
            <div className="min-h-100 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-secondary" />
                <p className="text-text-main/60 font-body animate-pulse">
                    Cargando pedidos...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-100 flex flex-col items-center justify-center gap-4">
                <div className="p-4 rounded-full bg-red-50">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <p className="font-display font-bold text-red-500 text-lg">Error</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="font-display text-4xl text-text-main font-bold mb-2 uppercase tracking-wide">
                        Pedidos
                    </h1>
                    <p className="font-body text-text-main/60">
                        Visualiza y gestiona todos los pedidos recibidos
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
            <span className="text-[10px] font-bold uppercase text-text-main/40 tracking-widest">
              Estado:
            </span>
                        <select
                            className="bg-transparent border-none text-sm font-semibold text-text-main focus:ring-0 cursor-pointer p-0"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">Todos</option>
                            <option value="pending">Pendiente</option>
                            <option value="confirmed">Confirmado</option>
                            <option value="preparing">Preparando</option>
                            <option value="ready">Listo</option>
                            <option value="delivered">Entregado</option>
                            <option value="cancelled">Cancelado</option>
                        </select>
                    </div>

                    {orderTypes.length > 0 && (
                        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
              <span className="text-[10px] font-bold uppercase text-text-main/40 tracking-widest">
                Tipo:
              </span>
                            <select
                                className="bg-transparent border-none text-sm font-semibold text-text-main focus:ring-0 cursor-pointer p-0"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="all">Todos</option>
                                {orderTypes.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap gap-3">
                {(
                    [
                        "pending",
                        "confirmed",
                        "preparing",
                        "ready",
                        "delivered",
                        "cancelled",
                    ] as const
                ).map((s) => {
                    const count = rows.filter(
                        (r) => r.order.status.toLowerCase() === s,
                    ).length;
                    if (count === 0) return null;
                    const style = STATUS_STYLES[s];
                    return (
                        <button
                            key={s}
                            type="button"
                            onClick={() =>
                                setFilterStatus((prev) => (prev === s ? "all" : s))
                            }
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${style.bg} ${style.text} ${filterStatus === s ? "ring-2 ring-offset-1 ring-current/30" : "opacity-70 hover:opacity-100"}`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            {s}
                            <span className="ml-0.5 opacity-70">({count})</span>
                        </button>
                    );
                })}
            </div>

            <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_rgba(232,213,213,0.3)] overflow-hidden border border-gray-100/50">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className="px-6 py-5 text-left text-xs font-bold uppercase tracking-widest text-text-main/50 bg-gray-50/50 border-b border-gray-100"
                                    >
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext(),
                                        )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                        </thead>
                        <tbody className="font-body">
                        {table.getRowModel().rows.map((row) => (
                            <tr
                                key={row.id}
                                className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0"
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="px-6 py-4">
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext(),
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {filteredData.length === 0 && (
                    <div className="p-20 text-center flex flex-col items-center gap-3">
                        <ShoppingBag className="w-12 h-12 text-text-main/10" />
                        <p className="text-text-main/40 font-medium">
                            No se encontraron pedidos con estos filtros.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}




