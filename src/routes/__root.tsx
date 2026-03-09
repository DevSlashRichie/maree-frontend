import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Footer } from "@/components/layers/footer";
import { Header } from "@/components/layers/header";
import { Nav } from "@/components/layers/nav";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="texture-bg dark:bg-background-dark text-text-main dark:text-text-light font-body transition-colors duration-300 pb-20 min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Nav />
    </div>
  );
}
