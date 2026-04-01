import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Cake,
  Calendar,
  Coffee,
  DollarSign,
  IceCream,
  Phone,
  User as UserIcon,
  Users,
  Utensils,
  UtensilsCrossed,
} from "lucide-react";
import { RewardCard } from "@/components/ui/reward-card";
import { useGetV1UsersUserId } from "@/lib/api";

export const Route = createFileRoute("/admin/users/$id")({
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

const REWARDS_DATA = [
  {
    id: 1,
    title: "Crepa Dulce Gratis",
    description:
      "Elige cualquier crepa dulce de nuestro menú clásico para celebrar.",
    icon: UtensilsCrossed,
    isAvailable: true,
  },
  {
    id: 2,
    title: "Café de Especialidad",
    description: "Un café latte o cappuccino mediano preparado por baristas.",
    icon: Coffee,
    isAvailable: false,
    points: 50,
  },
  {
    id: 3,
    title: "Bebida de Temporada",
    description: "Prueba nuestra bebida especial del mes totalmente gratis.",
    icon: IceCream,
    isAvailable: true,
  },
  {
    id: 4,
    title: "Postre Especial",
    description: "Un postre artesanal hecho en casa para endulzar tu día.",
    icon: Cake,
    isAvailable: false,
    points: 75,
  },
  {
    id: 5,
    title: "Combo Pareja",
    description: "Descuento especial en nuestro combo para dos personas.",
    icon: Utensils,
    isAvailable: false,
    points: 150,
  },
];

function RouteComponent() {
  const params = Route.useParams();
  const { data, isLoading, error } = useGetV1UsersUserId(params.id, {
    swr: {
      keepPreviousData: true,
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  });

  const user = data && data.status === 200 ? data.data : null;

  if (error || (data && data.status !== 200)) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error al cargar usuario</p>
          <Link to="/admin/users" className="text-secondary hover:underline">
            Volver al listado
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-background-light">
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-2 text-text-main/60 hover:text-text-main mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Volver al listado</span>
            </Link>

            <div className="flex flex-col md:flex-row gap-6">
              <aside className="w-full md:w-72 flex-shrink-0">
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse mb-4" />
                    <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-2" />
                  </div>
                </div>
              </aside>

              <main className="flex-1 space-y-6">
                <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                      </div>
                      <div className="h-5 w-32 bg-gray-200 rounded animate-pulse ml-8" />
                    </div>
                  ))}
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-main/60 mb-4">Usuario no encontrado</p>
          <Link to="/admin/users" className="text-secondary hover:underline">
            Volver al listado
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-2 text-text-main/60 hover:text-text-main mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Volver al listado</span>
          </Link>

          <div className="flex flex-col md:flex-row gap-6">
            <aside className="w-full md:w-72 flex-shrink-0">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-8">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-4">
                    <UserIcon className="w-12 h-12 text-text-main" />
                  </div>
                  <h1 className="text-xl font-bold text-text-main">
                    {user.firstName} {user.lastName}
                  </h1>
                </div>
              </div>
            </aside>

            <main className="flex-1 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Phone className="w-5 h-5 text-text-main/40" />
                    <span className="text-sm font-medium text-text-main/60">
                      Teléfono
                    </span>
                  </div>
                  <p className="text-text-main font-medium ml-8">
                    {user.phone}
                  </p>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-5 h-5 text-text-main/40" />
                    <span className="text-sm font-medium text-text-main/60">
                      Total Consumido
                    </span>
                  </div>
                  <p className="text-text-main font-medium ml-8">
                    ${(user.totalConsumed / 100).toLocaleString("es-MX")}
                  </p>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-5 h-5 text-text-main/40" />
                    <span className="text-sm font-medium text-text-main/60">
                      Total Visitas
                    </span>
                  </div>
                  <p className="text-text-main font-medium ml-8">
                    {user.totalVisits} visitas
                  </p>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-text-main/40" />
                    <span className="text-sm font-medium text-text-main/60">
                      Fecha de registro
                    </span>
                  </div>
                  <p className="text-text-main font-medium ml-8">
                    {new Date(user.createdAt).toLocaleDateString("es-CL", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div>
                <h2 className="font-display text-xl text-text-main font-bold mb-4">
                  Recompensas Disponibles
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {REWARDS_DATA.map((reward) => (
                    <RewardCard
                      key={reward.id}
                      title={reward.title}
                      description={reward.description}
                      icon={reward.icon}
                      isAvailable={reward.isAvailable}
                      points={reward.points}
                    />
                  ))}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
