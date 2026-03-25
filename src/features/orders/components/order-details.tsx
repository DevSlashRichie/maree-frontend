import { Button } from "@/components/button.tsx";
import { ItemDetails } from "@/features/orders/components/item-details.tsx";

interface Product {
  id: string;
  name: string;
}

interface ItemDetailsProp {
  id: string;
  name: string;
  quantity: number;
  ingredients: Product[];
}

interface OrderDetailsProps {
  userName: string;
  orderNumber: number;
  price: number;
  items: ItemDetailsProp[];
}

export function OrderDetails({
  userName,
  orderNumber,
  price,
  items,
}: OrderDetailsProps) {
  return (
    <div className="bg-card-light rounded-2xl border border-pink-soft/40 px-5 py-6 flex flex-col gap-5">
      <div className="flex items-baseline gap-3">
        <p className="font-display text-lg text-text-main">{userName}</p>
        <p className="font-mono text-[11px] uppercase tracking-widest text-text-main/40">
          Orden #{orderNumber}
        </p>
        <p className="font-display text-lg text-text-main ml-auto">
          ${price.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
        </p>
      </div>

      <hr className="border-pink-soft/20" />

      <div className="grid grid-cols-3 gap-3 items-stretch">
        {items.map((item) => (
          <ItemDetails
            key={item.id}
            name={item.name}
            quantity={item.quantity}
            ingredients={item.ingredients}
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
