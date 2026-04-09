import { ArrowLeft } from "lucide-react";
import { ItemCard } from "@/features/cart/components/item-card.tsx";
import { TotalCard } from "@/features/cart/components/total-card.tsx";

const MOCK_ITEMS = [
  {
    id: "1",
    name: "Crepa Personalizada",
    description: "Fresa, Nutella.",
    price: 109,
    quantity: 1,
    imageUrl:
      "https://images.unsplash.com/photo-1519676867240-f03562e64548?w=128&h=128&fit=crop",
    modifyLink: "#",
  },
];

export function Cart() {
  const total = MOCK_ITEMS.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div className="min-h-screen bg-background-light">
      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-8">
        <a
          href="google.com"
          className="flex items-center gap-1.5 text-sm text-text-main/50 hover:text-text-main transition-colors w-fit no-underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Seguir Comprando
        </a>

        <div className="flex flex-col gap-1">
          <h1 className="font-display text-5xl font-normal text-text-main m-0">
            Mi Orden
          </h1>
          <p className="text-sm text-text-main/50 m-0">
            Revisa tu selección antes de confirmar.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {MOCK_ITEMS.map((item) => (
            <ItemCard
              key={item.id}
              id={item.id}
              name={item.name}
              description={item.description}
              price={item.price}
              quantity={item.quantity}
              imageUrl={item.imageUrl}
              modifyLink={item.modifyLink}
            />
          ))}
        </div>

        <TotalCard total={total} />
      </div>
    </div>
  );
}
