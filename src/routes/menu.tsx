import { createFileRoute } from "@tanstack/react-router";
import { Button } from "../components/ui/button"; 
import { FoodCard } from "../components/ui/card";
import { Heading, Subheading } from "../components/ui/typography";

export const Route = createFileRoute("/menu")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="texture-bg min-h-screen pb-20">
      <header className="py-12 text-center">
        <Heading>Nuestro Menú</Heading>
        <p className="text-text-main/70 mt-4">
          Descubre nuestras especialidades hechas con amor.
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <Subheading>Dulces Momentos</Subheading>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <FoodCard
            title="Fresa Pasión"
            price="$95.00"
            description="Queso crema dulce, mermelada y fresa fresca."
            image="https://via.placeholder.com/300" 
            badge="POPULAR"
            onAdd={() => console.log("Agregado al carrito")}
          />

          <Button variant="category" className="mt-10 mx-auto block">
            Ver más opciones
          </Button>
        </div>
      </main>
    </div>
  );
}
