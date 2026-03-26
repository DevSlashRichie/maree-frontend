import {
  Cake,
  Coffee,
  IceCream,
  Utensils,
  UtensilsCrossed,
} from "lucide-react";

export const REWARDS_DATA = [
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

export type Reward = (typeof REWARDS_DATA)[0];
