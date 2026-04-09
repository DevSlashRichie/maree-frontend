import { createRootRoute, Outlet, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/hooks/use-auth-store";
import { Footer } from "@/layouts/footer";
import { Header } from "@/layouts/header";
import { Nav } from "@/layouts/nav";
import { getV1UsersMe } from "@/lib/api";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const router = useRouter();
  const {
    checkSession,
    isAuthenticated,
    setAuth,
    clearAuth,
    setInitialChecked,
  } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  // Initial session check on mount (Cookie-based rehydration)
  useEffect(() => {
    const initSession = async () => {
      // Fast fail if we know from localStorage that the session has already expired
      const { expiresAt } = useAuthStore.getState();
      if (expiresAt && new Date(expiresAt) <= new Date()) {
        console.info(
          "Skipping initial check; session already expired locally.",
        );
        clearAuth();
        setInitialChecked();
        setIsInitializing(false);
        return;
      }

      try {
        const { data: user, status } = await getV1UsersMe();
        if (user && status === 200) {
          setAuth(user);
        } else {
          clearAuth();
        }
      } catch {
        clearAuth();
      } finally {
        setInitialChecked();
        setIsInitializing(false);
      }
    };

    initSession();
  }, [setAuth, clearAuth, setInitialChecked]);

  useEffect(() => {
    const handleFocus = () => {
      if (isAuthenticated) {
        const isValid = checkSession();
        if (!isValid) {
          router.invalidate();
        }
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [isAuthenticated, checkSession, router]);

  if (isInitializing) {
    return null; // or a loading spinner
  }

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
