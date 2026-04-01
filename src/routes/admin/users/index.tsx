import { createFileRoute } from "@tanstack/react-router";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  Phone,
  User as UserIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useGetV1Users } from "@/lib/api";

export const Route = createFileRoute("/admin/users/")({
  component: RouteComponent,
});

type User = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  createdAt: string;
  totalConsumed: number;
  totalVisits: number;
};

const columnHelper = createColumnHelper<User>();

const columns = [
  columnHelper.accessor("firstName", {
    header: "Nombre",
    cell: (info) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
          <UserIcon className="w-5 h-5 text-text-main" />
        </div>
        <div>
          <p className="font-medium text-text-main">
            {info.row.original.firstName} {info.row.original.lastName}
          </p>
        </div>
      </div>
    ),
  }),
  columnHelper.accessor("phone", {
    header: "Teléfono",
    cell: (info) => (
      <div className="flex items-center gap-2 text-text-main/70">
        <Phone className="w-4 h-4" />
        <span>{info.getValue()}</span>
      </div>
    ),
  }),
  columnHelper.accessor("totalConsumed", {
    header: "Total Consumido",
    cell: (info) => {
      const value = info.getValue();
      return (
        <span className="font-medium text-text-main">
          ${(value / 100).toLocaleString("es-MX")}
        </span>
      );
    },
  }),
  columnHelper.accessor("totalVisits", {
    header: "Total Visitas",
    cell: (info) => (
      <span className="text-text-main/70">{info.getValue()} visitas</span>
    ),
  }),
];

const LIMIT = 5;

function RouteComponent() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useGetV1Users(
    { page, limit: LIMIT },
    {
      swr: {
        keepPreviousData: true,
        revalidateOnFocus: false,
        shouldRetryOnError: false,
      },
    },
  );

  const users = useMemo(() => {
    return data && data.status === 200 && Array.isArray(data.data?.users)
      ? data.data.users
      : [];
  }, [data]);

  const total =
    data && data.status === 200 && data.data?.total ? data.data.total : 0;
  const totalPages = Math.ceil(total / LIMIT);
  const start = total > 0 ? (page - 1) * LIMIT + 1 : 0;
  const end = Math.min(page * LIMIT, total);

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handlePrevPage = () => {
    if (page > 1) setPage((page) => page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage((page) => page + 1);
  };

  if (error || (data && data.status !== 200)) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error al cargar usuarios</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="font-display text-4xl text-text-main font-bold mb-2 uppercase tracking-wide">
                Usuarios
              </h1>
              <p className="font-body text-text-main/60">
                Gestiona los clientes
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(232,213,213,0.3)] overflow-hidden">
            {isLoading && users.length === 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-text-main/70 bg-gray-50 border-b border-gray-100">
                        Nombre
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-text-main/70 bg-gray-50 border-b border-gray-100">
                        Teléfono
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-text-main/70 bg-gray-50 border-b border-gray-100">
                        Total Consumido
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-text-main/70 bg-gray-50 border-b border-gray-100">
                        Total Visitas
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(LIMIT)].map((_, i) => (
                      <tr
                        // biome-ignore lint/suspicious/noArrayIndexKey: this requires to be index
                        key={`skeleton-${i}`}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <th
                              key={header.id}
                              className="px-6 py-4 text-left text-sm font-semibold text-text-main/70 bg-gray-50 border-b border-gray-100"
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody>
                      {table.getRowModel().rows.map((row) => (
                        <tr
                          key={row.id}
                          className="cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="px-6 py-4">
                              <button
                                type="button"
                                onClick={() => {
                                  window.location.href = `/admin/users/${row.original.id}`;
                                }}
                                className="block w-full text-left"
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext(),
                                )}
                              </button>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm text-text-main/60">
                    Mostrando {start}-{end} de {total}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrevPage}
                      disabled={page === 1 || isLoading}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5 text-text-main" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextPage}
                      disabled={page >= totalPages || isLoading}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5 text-text-main" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
