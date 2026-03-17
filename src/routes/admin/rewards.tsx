import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Switch,
} from "@headlessui/react";
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

export const Route = createFileRoute("/admin/rewards")({
  component: RouteComponent,
});

type Reward = {
  id: number;
  title: string;
  description: string;
  icon: string;
  isAvailable: boolean;
  points: number | null;
  discountType: "percentage" | "fixed";
  discountValue: number;
  applicableProducts: string[] | null;
};

const MOCK_PRODUCTS = [
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

const INITIAL_REWARDS: Reward[] = [
  {
    id: 1,
    title: "Crepa Dulce Gratis",
    description:
      "Elige cualquier crepa dulce de nuestro menú clásico para celebrar.",
    icon: "utensils-crossed",
    isAvailable: true,
    points: null,
    discountType: "percentage",
    discountValue: 100,
    applicableProducts: null,
  },
  {
    id: 2,
    title: "Café de Especialidad",
    description: "Un café latte o cappuccino mediano preparado por baristas.",
    icon: "coffee",
    isAvailable: false,
    points: 50,
    discountType: "percentage",
    discountValue: 50,
    applicableProducts: ["1"],
  },
  {
    id: 3,
    title: "Bebida de Temporada",
    description: "Prueba nuestra bebida especial del mes totalmente gratis.",
    icon: "ice-cream",
    isAvailable: true,
    points: null,
    discountType: "percentage",
    discountValue: 100,
    applicableProducts: null,
  },
  {
    id: 4,
    title: "Postre Especial",
    description: "Un postre artesanal hecho en casa para endulzar tu día.",
    icon: "cake",
    isAvailable: false,
    points: 75,
    discountType: "percentage",
    discountValue: 75,
    applicableProducts: ["10"],
  },
  {
    id: 5,
    title: "Combo Pareja",
    description: "Descuento especial en nuestro combo para dos personas.",
    icon: "utensils",
    isAvailable: false,
    points: 150,
    discountType: "percentage",
    discountValue: 30,
    applicableProducts: null,
  },
];

function getIconComponent(iconName: string) {
  const found = AVAILABLE_ICONS.find((i) => i.value === iconName);
  return found ? found.icon : UtensilsCrossed;
}

function RouteComponent() {
  const [rewards, setRewards] = useState<Reward[]>(INITIAL_REWARDS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    icon: "utensils-crossed",
    isAvailable: true,
    points: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: "",
    applicableProducts: "" as string,
    hasProductRestriction: false,
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      icon: "utensils-crossed",
      isAvailable: true,
      points: "",
      discountType: "percentage",
      discountValue: "",
      applicableProducts: "",
      hasProductRestriction: false,
    });
    setEditingReward(null);
    setIsFormOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.discountValue) {
      alert("Por favor completa el valor del descuento");
      return;
    }

    if (editingReward) {
      setRewards(
        rewards.map((r) =>
          r.id === editingReward.id
            ? {
              ...r,
              title: formData.title,
              description: formData.description,
              icon: formData.icon,
              isAvailable: formData.isAvailable,
              points: formData.points ? parseInt(formData.points, 10) : null,
              discountType: formData.discountType,
              discountValue: parseInt(formData.discountValue, 10),
              applicableProducts:
                formData.hasProductRestriction && formData.applicableProducts
                  ? [formData.applicableProducts]
                  : null,
            }
            : r,
        ),
      );
    } else {
      const newReward: Reward = {
        id: Date.now(),
        title: formData.title,
        description: formData.description,
        icon: formData.icon,
        isAvailable: formData.isAvailable,
        points: formData.points ? parseInt(formData.points, 10) : null,
        discountType: formData.discountType,
        discountValue: parseInt(formData.discountValue, 10),
        applicableProducts:
          formData.hasProductRestriction && formData.applicableProducts
            ? [formData.applicableProducts]
            : null,
      };
      setRewards([...rewards, newReward]);
    }
    setIsFormOpen(false);
  };

  const handleEdit = (reward: Reward) => {
    setEditingReward(reward);
    const hasRestriction =
      reward.applicableProducts !== null &&
      reward.applicableProducts.length > 0;
    setFormData({
      title: reward.title,
      description: reward.description,
      icon: reward.icon,
      isAvailable: reward.isAvailable,
      points: reward.points?.toString() || "",
      discountType: reward.discountType,
      discountValue: reward.discountValue?.toString() || "",
      applicableProducts: hasRestriction
        ? reward.applicableProducts?.[0] || ""
        : "",
      hasProductRestriction: hasRestriction,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    setRewards(rewards.filter((r) => r.id !== id));
    setDeleteConfirm(null);
  };

  const toggleAvailability = (id: number) => {
    setRewards(
      rewards.map((r) =>
        r.id === id ? { ...r, isAvailable: !r.isAvailable } : r,
      ),
    );
  };

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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-text-main mb-2"
                  >
                    Título
                  </label>
                  <input
                    id="title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
                    placeholder="Ej: Café Gratis"
                  />
                </div>

                <div>
                  <label
                    htmlFor="points"
                    className="block text-sm font-medium text-text-main mb-2"
                  >
                    Puntos requeridos (opcional)
                  </label>
                  <input
                    id="points"
                    type="number"
                    value={formData.points}
                    onChange={(e) =>
                      setFormData({ ...formData, points: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
                    placeholder="Ej: 50"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-text-main mb-2"
                >
                  Descripción
                </label>
                <textarea
                  id="description"
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all resize-none"
                  placeholder="Describe la recompensa..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          onClick={() =>
                            setFormData({ ...formData, icon: icon.value })
                          }
                          className={cn(
                            "p-3 rounded-xl border-2 transition-all",
                            formData.icon === icon.value
                              ? "border-secondary bg-secondary/10"
                              : "border-gray-200 hover:border-gray-300",
                          )}
                        >
                          <IconComponent className="w-6 h-6 text-text-main" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span className="block text-sm font-medium text-text-main mb-2">
                    Estado
                  </span>
                  <div className="flex items-center gap-6">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, isAvailable: true })
                      }
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all",
                        formData.isAvailable
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-200 text-gray-400",
                      )}
                    >
                      <Check className="w-5 h-5" />
                      <span className="text-sm font-medium">Disponible</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, isAvailable: false })
                      }
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all",
                        !formData.isAvailable
                          ? "border-gray-400 bg-gray-100 text-gray-600"
                          : "border-gray-200 text-gray-400",
                      )}
                    >
                      <X className="w-5 h-5" />
                      <span className="text-sm font-medium">No disponible</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="block text-sm font-medium text-text-main mb-2">
                      Tipo de descuento
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            discountType: "percentage",
                          })
                        }
                        className={cn(
                          "flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all",
                          formData.discountType === "percentage"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-gray-200 text-gray-500 hover:border-gray-300",
                        )}
                      >
                        %
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, discountType: "fixed" })
                        }
                        className={cn(
                          "flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all",
                          formData.discountType === "fixed"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-gray-200 text-gray-500 hover:border-gray-300",
                        )}
                      >
                        $
                      </button>
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="discountValue"
                      className="block text-sm font-medium text-text-main mb-2"
                    >
                      Valor
                    </label>
                    <input
                      id="discountValue"
                      type="number"
                      required
                      min={1}
                      max={
                        formData.discountType === "percentage" ? 100 : undefined
                      }
                      value={formData.discountValue}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountValue: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
                      placeholder={
                        formData.discountType === "percentage" ? "20" : "50"
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6">
                  <span className="text-sm font-medium text-text-main">
                    Aplicar a producto específico
                  </span>
                  <Switch
                    checked={formData.hasProductRestriction}
                    onChange={(checked) =>
                      setFormData({
                        ...formData,
                        hasProductRestriction: checked,
                        applicableProducts: checked
                          ? formData.applicableProducts
                          : "",
                      })
                    }
                    className={cn(
                      formData.hasProductRestriction
                        ? "bg-primary"
                        : "bg-gray-200",
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    )}
                  >
                    <span
                      className={cn(
                        formData.hasProductRestriction
                          ? "translate-x-6"
                          : "translate-x-1",
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      )}
                    />
                  </Switch>
                </div>

                {formData.hasProductRestriction && (
                  <div className="mt-4">
                    <p className="block text-sm font-medium text-text-main mb-2">
                      Producto
                    </p>
                    <Combobox
                      value={formData.applicableProducts}
                      onChange={(value) =>
                        setFormData({
                          ...formData,
                          applicableProducts: value || "",
                        })
                      }
                    >
                      <div className="relative">
                        <ComboboxInput
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
                          displayValue={() =>
                            MOCK_PRODUCTS.find(
                              (p) => p.id === formData.applicableProducts,
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
                        {MOCK_PRODUCTS.map((product) => (
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
                                  className={cn(selected ? "font-medium" : "")}
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
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-6 py-2 text-sm font-medium text-gray-500 hover:text-text-main transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  {editingReward ? "Guardar Cambios" : "Crear Recompensa"}
                </button>
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
                          ? MOCK_PRODUCTS.find(
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
