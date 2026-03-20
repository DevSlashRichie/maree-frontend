import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FoodCard } from "@/components/card";
import { Subheading } from "@/components/typography";
import { CategoryFilters } from "@/layouts/category-filters";
import { MenuHero } from "@/layouts/menu-hero";

const MENU_DATA = [
  {
    id: 1,
    title: "Fresa Pasión",
    price: "$95.00",
    description: "Queso crema dulce, mermelada y fresa fresca.",
    image:
      "https://images.unsplash.com/photo-1519676867240-f03562e64548?q=80&w=500",
    category: "Crepas Dulces",
    badge: "POPULAR",
  },
  {
    id: 2,
    title: "Clásica Salada",
    price: "$110.00",
    description: "Jamón serrano, queso mozzarella y arúgula.",
    image:
      "https://images.unsplash.com/photo-1621317911081-00ec931f6044?q=80&w=500",
    category: "Crepas Saladas",
  },
  {
    id: 3,
    title: "Waffle Frutos Rojos",
    price: "$85.00",
    description: "Waffle artesanal con miel de agave y berries.",
    image:
      "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=500",
    category: "Waffles",
  },
];

export const Route = createFileRoute("/_client/menu")({
  component: RouteComponent,
});

const CATEGORIES = [
  "Crepas Dulces",
  "Crepas Saladas",
  "Waffles",
  "Bebidas Calientes",
  "Bebidas Frías",
  "Especiales",
];

function RouteComponent() {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);

  const filteredItems = MENU_DATA.filter(
    (item) => item.category === activeCategory,
  );

  return (
    <>
      <MenuHero />
      <div className="texture-bg min-h-screen pb-20">
        <CategoryFilters
          categories={CATEGORIES}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <Subheading>{activeCategory}</Subheading>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <FoodCard
                  key={item.id}
                  title={item.title}
                  price={item.price}
                  description={item.description}
                  image={item.image}
                  badge={item.badge}
                  onAdd={() =>
                    console.log(`Agregado al carrito: ${item.title}`)
                  }
                />
              ))
            ) : (
              <div className="col-span-full py-20 text-center opacity-50 italic">
                Aún no hay delicias disponibles en esta categoría...
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
