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
import { Modal } from "@/components/ui/modal";
import { useGetV1Rewards, usePostV1Rewards } from "@/lib/api";
import type { RewardSchema } from "@/lib/schemas/rewardSchema";

export const Route = createFileRoute("/admin/rewards")({
  component: RouteComponent,
});

type RewardFormValues = {
  title: string;
  description: string;
  icon: string;
  isAvailable: boolean;
  points: string;
  discountType: "percentage" | "fixed";
  discountValue: string;
  applicableProducts: string;
  hasProductRestriction: boolean;
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

const AVAILABLE_PRODUCTS = [
  { id: "1", name: "Cappuccino" },
  { id: "2", name: "Latte" },
  { id: "3", name: "Espresso" },
  { id: "4", name: "Croissant" },
  { id: "5", name: "Muffin" },
  { id: "6", name: "Crepa Dulce" },
  { id: "7", name: "Crepa Salada" },
  { id: "8", name: "Frappé" },
  { id: "9", name: "Té Chai" },
  { id: "10", name: "Brownie" },
];

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

  const { trigger: createReward, isMutating: isCreatingReward } =
    usePostV1Rewards();

  const rewards: Reward[] =
    rewardsData?.data?.map((r: RewardSchema) => ({
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
    })) ?? [];

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

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
        alert("Por favor completa el valor del descuento");
        return;
      }

      const productName =
        value.hasProductRestriction && value.applicableProducts
          ? AVAILABLE_PRODUCTS.find((p) => p.id === value.applicableProducts)
            ?.name || ""
          : "";

      try {
        const result = await createReward({
          name: value.title,
          description: value.description,
          status: value.isAvailable ? "active" : "inactive",
          cost: String(value.points || 0),
          discount: {
            type: value.discountType,
            value: value.discountValue,
            appliesTo: productName ? [productName] : [],
          },
        });

        if (result.status === 201) {
          mutate();
          setIsFormOpen(false);
          resetForm();
        }
      } catch (error) {
        console.error("Error creating reward:", error);
        alert("Error al crear la recompensa");
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

  const handleDelete = (_id: string) => {
    alert("Funcionalidad de eliminación no disponible aún");
    setDeleteConfirm(null);
  };

  const toggleAvailability = (_id: string) => {
    alert("Funcionalidad de cambio de estado no disponible aún");
  };

  if (isLoadingRewards) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-text-main">Cargando recompensas...</div>
      </div>
    );
  }

  if (rewardsError) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-red-500">Error al cargar recompensas</div>
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
                        Puntos requeridos (opcional)
                      </label>
                      <input
                        id={field.name}
                        type="number"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
                        placeholder="Ej: 50"
                      />
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
                      <div className="flex items-center gap-6">
                        <button
                          type="button"
                          onClick={() => field.handleChange(true)}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all",
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
                            "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all",
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
                          <button
                            type="button"
                            onClick={() => field.handleChange("percentage")}
                            className={cn(
                              "flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all",
                              field.state.value === "percentage"
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-gray-200 text-gray-500 hover:border-gray-300",
                            )}
                          >
                            %
                          </button>
                          <button
                            type="button"
                            onClick={() => field.handleChange("fixed")}
                            className={cn(
                              "flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all",
                              field.state.value === "fixed"
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-gray-200 text-gray-500 hover:border-gray-300",
                            )}
                          >
                            $
                          </button>
                        </div>
                      </div>
                    )}
                  </form.Field>

                  <form.Subscribe selector={(state) => state.values.discountType}>
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
                      <span className="text-sm font-medium text-text-main">
                        Aplicar a producto específico
                      </span>
                      <Switch
                        checked={field.state.value}
                        onChange={(checked) => {
                          field.handleChange(checked);
                          if (!checked) {
                            form.setFieldValue("applicableProducts", "");
                          }
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
                                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
                                  displayValue={() =>
                                    AVAILABLE_PRODUCTS.find(
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
                                {AVAILABLE_PRODUCTS.map((product) => (
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
                  onClick={() => setIsFormOpen(false)}
                  className="px-6 py-2 text-sm font-medium text-gray-500 hover:text-text-main transition-colors"
                >
                  Cancelar
                </button>
                <form.Subscribe selector={(state) => state.canSubmit}>
                  {(canSubmit) => (
                    <button
                      type="submit"
                      disabled={!canSubmit || isCreatingReward}
                      className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      {isCreatingReward
                        ? "Creando..."
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
                          ? AVAILABLE_PRODUCTS.find(
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
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(null)}
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
                className="mt-4 text-secondary hover:underline"
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
