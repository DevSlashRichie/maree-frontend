import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FoodCard } from "@/components/card";
import { Subheading } from "@/components/typography";
import { CategoryFilters } from "@/layouts/category-filters";
import { MenuHero } from "@/layouts/menu-hero";
import { useGetV1Products } from "@/lib/api";

export const Route = createFileRoute("/")({
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
  const { data, isLoading, error } = useGetV1Products();

  const menuData = data?.status === 200 ? data.data.products : [];

  const filteredItems = menuData;

  if (isLoading) {
    return (
      <>
        <MenuHero />
        <div className="texture-bg min-h-screen pb-20 flex items-center justify-center">
          <p className="text-accent">Cargando menú...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <MenuHero />
        <div className="texture-bg min-h-screen pb-20 flex items-center justify-center">
          <p className="text-red-500">Error al cargar el menú</p>
        </div>
      </>
    );
  }

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
                  title={item.name}
                  price="$0.00"
                  description="Descripción no disponible"
                  image="https://images.unsplash.com/photo-1519676867240-f03562e64548?q=80&w=500"
                  onAdd={() => console.log(`Agregado al carrito: ${item.name}`)}
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
