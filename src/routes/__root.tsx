import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Header } from "@/components/layers/header";
import { Footer } from "@/components/layers/footer";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
      <div className="bg-background-light min-h-screen font-body text-text-main flex flex-col pb-20 lg:pb-0"> 
        <Header />
          <main className="flex-grow">
            <Outlet />
          </main>
          <Footer />
      </div>
  );
}