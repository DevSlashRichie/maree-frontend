import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  Check,
  DollarSign,
  Phone,
  Plus,
  User as UserIcon,
  Users,
  Utensils,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/modal";
import { RewardCard } from "@/components/ui/reward-card";
import {
  useGetV1Branches,
  useGetV1Rewards,
  useGetV1UsersUserId,
  usePostV1RewardsRedeem,
  usePostV1RewardsVisit,
} from "@/lib/api";
import type { RewardSchema } from "@/lib/schemas";

export const Route = createFileRoute("/admin/users/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<RewardSchema | null>(
    null,
  );

  const { data, isLoading, error, mutate } = useGetV1UsersUserId(params.id, {
    swr: {
      keepPreviousData: true,
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  });

  const { data: rewardsData, isLoading: isLoadingRewards } = useGetV1Rewards();
  const { data: branchesData } = useGetV1Branches();

  const user = data && data.status === 200 ? data.data : null;
  const rewards =
    rewardsData && rewardsData.status === 200 ? rewardsData.data : [];
  const branches =
    branchesData && branchesData.status === 200 ? branchesData.data : [];

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

  if ((isLoading || isLoadingRewards) && !user) {
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
                    // biome-ignore lint/suspicious/noArrayIndexKey: required for skeleton
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
                  <div className="flex items-center justify-between ml-8">
                    <p className="text-text-main font-medium">
                      {user.totalVisits} visitas
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="text-sm bg-gray-100 hover:bg-gray-200 text-text-main px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Añadir
                    </button>
                  </div>
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
                  {rewards.map((reward) => (
                    <RewardCard
                      key={reward.id}
                      title={reward.name}
                      description={reward.description}
                      icon={Utensils}
                      isAvailable={
                        reward.status === "active" &&
                        user.totalVisits >= Number(reward.cost)
                      }
                      points={Number(reward.cost)}
                      onRedeem={() => setSelectedReward(reward)}
                    />
                  ))}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      <AddVisitsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={user}
        onSave={(amount) => {
          mutate((prev) => {
            if (!prev) return prev;

            if (prev.status === 200) {
              return {
                ...prev,
                data: {
                  ...prev.data,
                  totalVisits: amount,
                },
              };
            }

            return prev;
          });
        }}
      />

      {selectedReward && (
        <RedeemRewardModal
          isOpen={!!selectedReward}
          onClose={() => setSelectedReward(null)}
          reward={selectedReward}
          user={user}
          branchId={branches[0]?.id}
          onSave={(newBalance) => {
            mutate((prev) => {
              if (!prev) return prev;

              if (prev.status === 200) {
                return {
                  ...prev,
                  data: {
                    ...prev.data,
                    totalVisits: newBalance,
                  },
                };
              }

              return prev;
            });
          }}
        />
      )}
    </div>
  );
}

function AddVisitsModal({
  isOpen,
  onClose,
  user,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: { id: string; firstName: string; lastName: string };
  onSave?: (newAmount: number) => void;
}) {
  const { trigger } = usePostV1RewardsVisit();

  const form = useForm({
    defaultValues: {
      visits: 1,
    },
    onSubmit: async ({ value }) => {
      const result = await trigger({
        userId: user.id,
        amount: value.visits,
      });

      if (result.status === 200) {
        onSave?.(Number(result.data.newBalance));
      } else {
        toast.error(result.data.message);
      }

      form.reset();
      onClose();
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Añadir Visitas"
      description={`¿Cuántas visitas deseas añadir para ${user.firstName} ${user.lastName}?`}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="mt-4 flex flex-col gap-4"
      >
        <div>
          <label
            htmlFor="visits"
            className="block text-sm font-medium text-text-main/80 mb-1"
          >
            Número de Visitas
          </label>
          <form.Field
            name="visits"
            validators={{
              onChange: ({ value }) =>
                value < 1 ? "Debe ser al menos 1 visita" : undefined,
            }}
          >
            {(field) => (
              <>
                <input
                  id="visits"
                  type="number"
                  min="1"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  onBlur={field.handleBlur}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-colors"
                />
                {field.state.meta.errors ? (
                  <p className="text-red-500 text-xs mt-1">
                    {field.state.meta.errors.join(", ")}
                  </p>
                ) : null}
              </>
            )}
          </form.Field>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-text-main/60 hover:text-text-main hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            Cancelar
          </button>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="bg-secondary text-text-main px-4 py-2 rounded-xl font-medium hover:bg-secondary/90 transition-colors flex items-center justify-center text-sm disabled:opacity-50"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                {isSubmitting ? "Añadiendo..." : "Añadir Visitas"}
              </button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </Modal>
  );
}

function RedeemRewardModal({
  isOpen,
  onClose,
  reward,
  user,
  branchId,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  reward: RewardSchema;
  user: { id: string; firstName: string; lastName: string };
  branchId?: string;
  onSave?: (newBalance: number) => void;
}) {
  const { trigger, isMutating } = usePostV1RewardsRedeem();

  const handleRedeem = async () => {
    if (!branchId) {
      toast.error("No hay sucursales disponibles para realizar el canje");
      return;
    }

    const result = await trigger({
      userId: user.id,
      rewardId: reward.id,
      branchId,
    });

    if (result.status === 200) {
      toast.success("Recompensa canjeada con éxito");
      onSave?.(Number(result.data.newBalance));
      onClose();
    } else {
      toast.error(result.data.message || "Error al canjear recompensa");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmar Canje"
      description={`¿Estás seguro de que deseas canjear "${reward.name}" por ${reward.cost} visitas para ${user.firstName} ${user.lastName}?`}
    >
      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-text-main/60 hover:text-text-main hover:bg-gray-50 transition-colors font-medium text-sm"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleRedeem}
          disabled={isMutating}
          className="bg-secondary text-text-main px-4 py-2 rounded-xl font-medium hover:bg-secondary/90 transition-colors flex items-center justify-center text-sm disabled:opacity-50"
        >
          <Check className="w-4 h-4 mr-1.5" />
          {isMutating ? "Canjeando..." : "Confirmar Canje"}
        </button>
      </div>
    </Modal>
  );
}
