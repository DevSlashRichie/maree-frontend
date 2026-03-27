import { Button } from "@/components/button.tsx";
import { ItemDetails } from "@/features/orders/components/item-details.tsx";

interface OrderDetailsProps {
  id: string;
}

export function OrderDetails({ id }: OrderDetailsProps) {
  // make a fetch to get the order details with the id
  const mockItems = [
    {
      id: "1",
      name: "Crepe",
      quantity: 2,
      ingredients: [
        { id: "1", name: "Queso" },
        { id: "2", name: "Chocolate" },
        { id: "3", name: "Sal" },
      ],
    },
    {
      id: "2",
      name: "Tarta de Chocolate",
      quantity: 1,
      ingredients: [
        { id: "1", name: "Queso" },
        { id: "2", name: "Chocolate" },
        { id: "3", name: "Sal" },
      ],
    },
  ];
  return (
    <div className="bg-card-light rounded-2xl border border-pink-soft/40 px-5 py-6 flex flex-col gap-5">
      <div className="flex items-baseline gap-3">
        <p className="font-display text-lg text-text-main">{`something`}</p>
        <p className="font-mono text-[11px] uppercase tracking-widest text-text-main/40">
          Orden #{`something`}
        </p>
        <p className="font-display text-lg text-text-main ml-auto">
          ${`something`}
        </p>
      </div>

      <hr className="border-pink-soft/20" />

      <div className="flex flex-wrap gap-3 items-stretch">
        {mockItems.map((item) => (
          <ItemDetails
            key={item.id}
            name={item.name}
            quantity={item.quantity}
            ingredients={item.ingredients}
            className="w-40 flex-shrink-0" // fixed card width, wraps naturally
          />
        ))}
      </div>

      <hr className="border-pink-soft/20" />

      <div className="flex justify-end">
        <Button variant="action">Aceptar</Button>
      </div>
    </div>
  );
}
