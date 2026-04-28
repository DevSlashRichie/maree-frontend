import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Switch,
} from "@headlessui/react";
import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import cn from "classnames";
import {
  Cake,
  Check,
  ChevronDown,
  Coffee,
  IceCream,
  Pencil,
  Plus,
  Trash2,
  Utensils,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/modal";
import { Tooltip } from "@/components/ui/tooltip";
import { requirePolicy } from "@/hooks/with-auth";
import {
  deleteV1RewardsRewardId,
  patchV1RewardsRewardId,
  useGetV1ProductsVariants,
  useGetV1Rewards,
  usePostV1Rewards,
} from "@/lib/api";
import type { RewardSchema } from "@/lib/schemas/rewardSchema";

export const Route = createFileRoute("/admin/rewards")({
  beforeLoad: () => requirePolicy("read:rewards"),
  component: RouteComponent,
});

type Variant = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  image: string | null;
  productId: string;
  createdAt: string;
  product: {
    id: string;
    image: string | null;
    name: string;
    status: string;
    categoryId: string;
    type: string;
    createdAt: string;
  };
};

type Reward = {
  id: string;
  title: string;
  description: string;
  icon: string;
  isAvailable: boolean;
  points: number | null;
  discountType: "percentage" | "fixed";
  discountValue: number;
  applicableProducts: string[] | null;
  status: string;
  cost: string;
  discountId: string;
  image: string | null;
  createdAt: string;
};

const AVAILABLE_ICONS = [
  {
    value: "utensils-crossed",
    label: "Utensils Crossed",
    icon: UtensilsCrossed,
  },
  { value: "coffee", label: "Coffee", icon: Coffee },
  { value: "ice-cream", label: "Ice Cream", icon: IceCream },
  { value: "cake", label: "Cake", icon: Cake },
  { value: "utensils", label: "Utensils", icon: Utensils },
];

function getIconComponent(iconName: string) {
  const found = AVAILABLE_ICONS.find((i) => i.value === iconName);
  return found ? found.icon : UtensilsCrossed;
}

function RouteComponent() {
  const {
    data: rewardsData,
    isLoading: isLoadingRewards,
    error: rewardsError,
    mutate,
  } = useGetV1Rewards();

  const {
    data: variantsData,
    isLoading: isLoadingVariants,
    error: variantsError,
  } = useGetV1ProductsVariants();

  const { trigger: createReward, isMutating: isCreatingReward } =
    usePostV1Rewards();

  const variants: Variant[] =
    (variantsData?.status === 200 ? variantsData?.data?.variants : []) ?? [];

  const rewards: Reward[] = (rewardsData?.data ?? []).map(
    (r: RewardSchema) => ({
      id: r.id,
      title: r.name.replace("REWARD-", ""),
      description: r.description,
      icon: "utensils-crossed",
      isAvailable: r.status === "active",
      points: parseInt(r.cost, 10) || null,
      discountType: r.discount.type as "percentage" | "fixed",
      discountValue: parseInt(r.discount.value, 10),
      applicableProducts:
        r.discount.appliesTo.length > 0 ? r.discount.appliesTo : null,
      status: r.status,
      cost: r.cost,
      discountId: r.discountId,
      image: r.image,
      createdAt: r.createdAt,
    }),
  );

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      icon: "utensils-crossed",
      isAvailable: true,
      points: "",
      discountType: "percentage" as "percentage" | "fixed",
      discountValue: "",
      applicableProducts: "",
      hasProductRestriction: false,
    },
    onSubmit: async ({ value }) => {
      if (!value.discountValue) {
        toast.error("Por favor completa el valor del descuento");
        return;
      }

      const applicableProductId =
        value.hasProductRestriction && value.applicableProducts
          ? value.applicableProducts
          : "";

      try {
        if (editingReward) {
          setIsUpdating(true);
          const result = await patchV1RewardsRewardId(editingReward.id, {
            name: value.title,
            description: value.description,
            status: value.isAvailable ? "active" : "inactive",
            cost: String(value.points || 0),
          });

          if (result.status === 200) {
            await mutate();
            setIsFormOpen(false);
            resetForm();
            toast.success("Recompensa actualizada");
          } else {
            alert("Error al actualizar la recompensa");
          }
        } else {
          const result = await createReward({
            name: value.title,
            description: value.description,
            status: value.isAvailable ? "active" : "inactive",
            cost: String(value.points || 0),
            discount: {
              type: value.discountType,
              value: value.discountValue,
              appliesTo: applicableProductId ? [applicableProductId] : [],
            },
          });

          if (result.status === 201) {
            await mutate();
            setIsFormOpen(false);
            resetForm();
            toast.success("Recompensa creada");
          }
        }
      } catch (error) {
        console.error("Error saving reward:", error);
        alert("Error al guardar la recompensa");
      } finally {
        setIsUpdating(false);
      }
    },
  });

  const handleEdit = (reward: Reward) => {
    setEditingReward(reward);
    const hasRestriction =
      reward.applicableProducts !== null &&
      reward.applicableProducts.length > 0;
    form.setFieldValue("title", reward.title);
    form.setFieldValue("description", reward.description);
    form.setFieldValue("icon", reward.icon);
    form.setFieldValue("isAvailable", reward.isAvailable);
    form.setFieldValue("points", reward.points?.toString() || "");
    form.setFieldValue(
      "discountType",
      reward.discountType as "percentage" | "fixed",
    );
    form.setFieldValue("discountValue", reward.discountValue?.toString() || "");
    form.setFieldValue(
      "applicableProducts",
      hasRestriction ? reward.applicableProducts?.[0] || "" : "",
    );
    form.setFieldValue("hasProductRestriction", hasRestriction);
    setIsFormOpen(true);
  };

  const resetForm = () => {
    form.reset();
    setEditingReward(null);
    setIsFormOpen(false);
  };

  const handleDelete = async (id: string) => {
    const f = async () => {
      try {
        const response = await deleteV1RewardsRewardId(id);
        if (response.status === 204) {
          await mutate();
        } else {
          toast.error("No se pudo eliminar la recompensa");
        }
      } catch (error) {
        console.error("Error deleting reward:", error);
        alert("Error al intentar eliminar la recompensa");
      } finally {
        setDeleteConfirm(null);
      }
    };

    await toast.promise(f(), {
      error: "No se pudo eliminar.",
      loading: "Eliminando...",
      success: "Recompensa eliminada.",
    });
  };

  const toggleAvailability = async (id: string) => {
    const reward = rewards.find((r) => r.id === id);
    if (!reward) return;

    const newStatus = reward.isAvailable ? "inactive" : "active";

    try {
      const result = await patchV1RewardsRewardId(id, { status: newStatus });

      if (result.status === 200) {
        await mutate();
        toast.success(
          newStatus === "active"
            ? "Recompensa activada"
            : "Recompensa desactivada",
        );
      }
    } catch (error) {
      console.error("Error toggling availability:", error);
      toast.error("Error al cambiar el estado");
    }
  };

  if (isLoadingRewards || isLoadingVariants) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-text-main">Cargando...</div>
      </div>
    );
  }

  if (rewardsError || variantsError) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-red-500">Error al cargar: Error desconocido</div>
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
                Recompensas
              </h1>
              <p className="font-body text-text-main/60">
                Gestiona las recompensas del programa de lealtad
              </p>
            </div>
            {!isFormOpen && (
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="text-sm font-medium">Nueva Recompensa</span>
              </button>
            )}
          </div>

          <Modal
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            afterClose={resetForm}
            title={editingReward ? "Editar Recompensa" : "Nueva Recompensa"}
            description="Completa los detalles de la recompensa"
            maxWidth="xl"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <form.Field name="title">
                  {(field) => (
                    <div>
                      <label
                        htmlFor={field.name}
                        className="block text-sm font-medium text-text-main mb-2"
                      >
                        Título
                      </label>
                      <input
                        id={field.name}
                        type="text"
                        required
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
                        placeholder="Ej: Café Gratis"
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="points">
                  {(field) => (
                    <div>
                      <label
                        htmlFor={field.name}
                        className="block text-sm font-medium text-text-main mb-2"
                      >
                        Visitas requeridas
                      </label>
                      <Tooltip
                        content="Puntos necesarios para canjear esta recompensa. Deja vacío para recompensas gratuitas."
                        placement="right"
                      >
                        <input
                          id={field.name}
                          type="number"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
                          placeholder="Ej: 50"
                          min={0}
                        />
                      </Tooltip>
                    </div>
                  )}
                </form.Field>
              </div>

              <form.Field name="description">
                {(field) => (
                  <div>
                    <label
                      htmlFor={field.name}
                      className="block text-sm font-medium text-text-main mb-2"
                    >
                      Descripción
                    </label>
                    <textarea
                      id={field.name}
                      required
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all resize-none"
                      placeholder="Describe la recompensa..."
                    />
                  </div>
                )}
              </form.Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <form.Field name="icon">
                  {(field) => (
                    <div>
                      <span className="block text-sm font-medium text-text-main mb-2">
                        Icono
                      </span>
                      <div className="flex gap-2 flex-wrap">
                        {AVAILABLE_ICONS.map((icon) => {
                          const IconComponent = icon.icon;
                          return (
                            <button
                              key={icon.value}
                              type="button"
                              onClick={() => field.handleChange(icon.value)}
                              className={cn(
                                "p-3 rounded-xl border-2 transition-all",
                                field.state.value === icon.value
                                  ? "border-green-500 bg-secondary/10"
                                  : "border-gray-200 hover:border-gray-300",
                              )}
                            >
                              <IconComponent className="w-6 h-6 text-text-main" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </form.Field>

                <form.Field name="isAvailable">
                  {(field) => (
                    <div>
                      <span className="block text-sm font-medium text-text-main mb-2">
                        Estado
                      </span>
                      <div className="flex flex-col items-center gap-1">
                        <button
                          type="button"
                          onClick={() => field.handleChange(true)}
                          className={cn(
                            "w-full flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all",
                            field.state.value
                              ? "border-green-500 bg-green-50 text-green-700"
                              : "border-gray-200 text-gray-400",
                          )}
                        >
                          <Check className="w-5 h-5" />
                          <span className="text-sm font-medium">
                            Disponible
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => field.handleChange(false)}
                          className={cn(
                            "w-full flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all",
                            !field.state.value
                              ? "border-gray-400 bg-gray-100 text-gray-600"
                              : "border-gray-200 text-gray-400",
                          )}
                        >
                          <X className="w-5 h-5" />
                          <span className="text-sm font-medium">
                            No disponible
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </form.Field>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <form.Field name="discountType">
                    {(field) => (
                      <div>
                        <p className="block text-sm font-medium text-text-main mb-2">
                          Tipo de descuento
                        </p>
                        <div className="flex gap-2">
                          <Tooltip
                            content="Aplica un porcentaje de descuento sobre el precio total"
                            placement="top"
                          >
                            <button
                              type="button"
                              data-testid="discount-percentage"
                              onClick={() => field.handleChange("percentage")}
                              className={cn(
                                "flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all",
                                field.state.value === "percentage"
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-gray-200 text-gray-500 hover:border-gray-300",
                              )}
                            >
                              %
                            </button>
                          </Tooltip>
                          <Tooltip
                            content="Aplica un monto fijo a descontar del precio total"
                            placement="top"
                          >
                            <button
                              type="button"
                              data-testid="discount-fixed"
                              onClick={() => field.handleChange("fixed")}
                              className={cn(
                                "flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all",
                                field.state.value === "fixed"
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-gray-200 text-gray-500 hover:border-gray-300",
                              )}
                            >
                              $
                            </button>
                          </Tooltip>
                        </div>
                      </div>
                    )}
                  </form.Field>

                  <form.Subscribe
                    selector={(state) => state.values.discountType}
                  >
                    {(discountType) => (
                      <form.Field name="discountValue">
                        {(field) => (
                          <div>
                            <label
                              htmlFor={field.name}
                              className="block text-sm font-medium text-text-main mb-2"
                            >
                              Valor
                            </label>
                            <input
                              id={field.name}
                              type="number"
                              required
                              min={1}
                              max={
                                discountType === "percentage" ? 100 : undefined
                              }
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
                              placeholder={
                                discountType === "percentage" ? "20" : "50"
                              }
                            />
                          </div>
                        )}
                      </form.Field>
                    )}
                  </form.Subscribe>
                </div>

                <form.Field name="hasProductRestriction">
                  {(field) => (
                    <div className="flex items-center justify-between mt-6">
                      <Tooltip
                        content="Limita el descuento solo al producto seleccionado"
                        placement="top"
                      >
                        <span className="text-sm font-medium text-text-main cursor-help">
                          Aplicar a producto específico
                        </span>
                      </Tooltip>
                      <Switch
                        data-testid="product-restriction-switch"
                        checked={field.state.value}
                        onChange={(checked) => {
                          field.handleChange(checked);
                          if (!checked)
                            form.setFieldValue("applicableProducts", "");
                        }}
                        className={cn(
                          field.state.value ? "bg-primary" : "bg-gray-200",
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                        )}
                      >
                        <span
                          className={cn(
                            field.state.value
                              ? "translate-x-6"
                              : "translate-x-1",
                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                          )}
                        />
                      </Switch>
                    </div>
                  )}
                </form.Field>

                <form.Subscribe
                  selector={(state) => state.values.hasProductRestriction}
                >
                  {(hasProductRestriction) =>
                    hasProductRestriction ? (
                      <form.Field name="applicableProducts">
                        {(field) => (
                          <div className="mt-4">
                            <p className="block text-sm font-medium text-text-main mb-2">
                              Producto
                            </p>
                            <Combobox
                              value={field.state.value}
                              onChange={(value) =>
                                field.handleChange(value || "")
                              }
                            >
                              <div className="relative">
                                <ComboboxInput
                                  data-testid="product-search-input"
                                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
                                  displayValue={() =>
                                    variants.find(
                                      (p) => p.id === field.state.value,
                                    )?.name || ""
                                  }
                                  placeholder="Buscar producto..."
                                />
                                <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-4">
                                  <ChevronDown className="w-5 h-5 text-gray-400" />
                                </ComboboxButton>
                              </div>
                              <ComboboxOptions
                                className={cn(
                                  "mt-1 bg-white border border-gray-200 rounded-xl shadow-lg focus:outline-none empty:invisible",
                                  "w-(--input-width) [--anchor-gap:--spacing(1)] empty:invisible",
                                  "transition duration-100 ease-in data-leave:data-closed:opacity-0",
                                )}
                                transition
                                anchor="bottom"
                              >
                                {variants.map((product) => (
                                  <ComboboxOption
                                    key={product.id}
                                    value={product.id}
                                    className={({ focus, selected }) =>
                                      cn(
                                        "px-4 py-3 cursor-pointer select-none",
                                        focus ? "bg-gray-100" : "",
                                        selected
                                          ? "bg-primary/10 text-primary"
                                          : "text-text-main",
                                      )
                                    }
                                  >
                                    {({ selected }) => (
                                      <div className="flex justify-between items-center">
                                        <span
                                          className={cn(
                                            selected ? "font-medium" : "",
                                          )}
                                        >
                                          {product.name}
                                        </span>
                                        {selected && (
                                          <Check className="w-4 h-4 text-primary" />
                                        )}
                                      </div>
                                    )}
                                  </ComboboxOption>
                                ))}
                              </ComboboxOptions>
                            </Combobox>
                          </div>
                        )}
                      </form.Field>
                    ) : null
                  }
                </form.Subscribe>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  data-testid="cancel-button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-6 py-2 text-sm font-medium text-gray-500 hover:text-text-main transition-colors"
                >
                  Cancelar
                </button>
                <form.Subscribe selector={(state) => state.canSubmit}>
                  {(canSubmit) => (
                    <button
                      type="submit"
                      data-testid="submit-button"
                      disabled={!canSubmit || isCreatingReward || isUpdating}
                      className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      {isCreatingReward || isUpdating
                        ? editingReward
                          ? "Guardando..."
                          : "Creando..."
                        : editingReward
                          ? "Guardar Cambios"
                          : "Crear Recompensa"}
                    </button>
                  )}
                </form.Subscribe>
              </div>
            </form>
          </Modal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward) => {
              const IconComponent = getIconComponent(reward.icon);
              return (
                <div
                  key={reward.id}
                  className={cn(
                    "bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(232,213,213,0.3)] transition-all",
                    !reward.isAvailable ? "opacity-60" : "",
                  )}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={cn(
                        "p-3 rounded-xl",
                        reward.isAvailable
                          ? "bg-secondary/20 text-secondary"
                          : "bg-gray-100 text-gray-400",
                      )}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleAvailability(reward.id)}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                        reward.isAvailable
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500",
                      )}
                    >
                      {reward.isAvailable ? "Disponible" : "No disponible"}
                    </button>
                  </div>

                  <h3 className="font-display text-lg text-text-main font-bold mb-2">
                    {reward.title}
                  </h3>
                  <p className="text-sm text-text-main/60 mb-4 line-clamp-2">
                    {reward.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-primary uppercase">
                        Descuento
                      </span>
                      <span className="text-sm font-bold text-primary">
                        {reward.discountType === "percentage"
                          ? `${reward.discountValue}%`
                          : `$${reward.discountValue}`}{" "}
                        de descuento
                      </span>
                      <span className="text-xs text-gray-400">
                        {reward.applicableProducts &&
                        reward.applicableProducts.length > 0
                          ? variants.find(
                              (p) => p.id === reward.applicableProducts?.[0],
                            )?.name
                          : "Todos los productos"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(reward)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <Pencil className="w-4 h-4 text-gray-500" />
                      </button>
                      {deleteConfirm === reward.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleDelete(reward.id)}
                            data-test="delete-confirm"
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(null)}
                            data-test="delete-confirm-cancel"
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <X className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(reward.id)}
                          className="p-2 hover:bg-red-50 rounded-full transition-colors group"
                          data-test="delete-button"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {rewards.length === 0 && (
            <div className="text-center py-12">
              <p className="text-text-main/60">
                No hay recompensas disponibles.
              </p>
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="mt-4 text-text-main/50 hover:underline"
              >
                Crear primera recompensa
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
