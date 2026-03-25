import { Button } from "@headlessui/react";

interface Product {
    id: string;
    name: string;
}

interface ItemDetailsProps {
    name: string;
    quantity: number;
    ingredients: Product[];
}

export function ItemDetails({ name, quantity, ingredients }: ItemDetailsProps) {
    return (
        <div className="bg-card-light rounded-2xl border border-pink-soft/40 px-5 py-6 my-3 flex flex-col gap-4 w-64">

            <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-xl text-text-main font-normal leading-tight">
                    {name}
                </h2>
                <span className="shrink-0 flex items-center gap-1 bg-background-light border border-pink-soft/30 rounded-lg px-2.5 py-1 text-xs text-text-main/50">
          x<strong className="font-mono font-medium text-text-main">{quantity}</strong>
        </span>
            </div>

            <hr className="border-pink-soft/20" />

            <div>
                <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-text-main/30 mb-2">
                    Ingredientes
                </p>
                <ul className="flex flex-col gap-1.5">
                    {ingredients.map((ingredient) => (
                        <li key={ingredient.id} className="flex items-center gap-2 text-sm text-text-main/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                            {ingredient.name}
                        </li>
                    ))}
                </ul>
            </div>

            <hr className="border-pink-soft/20" />

            <Button variant="action">Aceptar</Button>
        </div>
    );
}