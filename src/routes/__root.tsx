import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Header } from '../components/layers/header'

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      {/* El Header aparecerá en todas las rutas */}
      <Header />

      {/* El Outlet es donde se "inyectan" tus páginas (como /menu) */}
      <main className="min-h-screen">
        <Outlet />
      </main>

      {/* Footer de MARÉE */}
      <footer className="bg-white dark:bg-card-dark py-16 border-t border-pink-soft/30 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            <div>
              <h2 className="font-display text-2xl font-bold text-text-main dark:text-white tracking-widest">MARÉE</h2>
              <p className="text-[10px] uppercase tracking-[0.2em] font-light mt-2 text-text-main/60 dark:text-gray-400">
                Love at first <span className="text-pink-logo">crêpe</span>
              </p>
            </div>
            {/* ... resto del contenido del footer ... */}
          </div>
          <div className="mt-16 pt-8 border-t border-pink-soft/30 text-center text-[10px] text-text-main/50 tracking-[0.2em] uppercase">
            © 2023 MARÉE. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </>
  );
}