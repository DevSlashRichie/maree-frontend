import { redirect } from "@tanstack/react-router";
import { getV1UsersMe } from "@/lib/api";
import { useAuthStore } from "./use-auth-store";

/**
 * Auth guard to be used in TanStack Router's `beforeLoad` hook.
 *
 * @example
 * export const Route = createFileRoute('/admin')({
 *   beforeLoad: (ctx) => requireAuth({ location: ctx.location, navigateTo: '/login' }),
 *   pendingComponent: () => <div>Loading...</div>
 * })
 */
export async function requireAuth({
  location,
  navigateTo = "/",
}: {
  location: { href: string };
  navigateTo?: string;
}) {
  const { isAuthenticated, setAuth, clearAuth, isInDev } =
    useAuthStore.getState();

  // Recommendation 6: Keep Dev Environment Bypass (Intentionally bypassing in dev)
  if (isInDev) {
    return;
  }

  // Already authenticated in store
  if (isAuthenticated) {
    return;
  }

  try {
    const { data: user, status } = await getV1UsersMe();

    if (user && status === 200) {
      setAuth(user);
      console.info("Session validated via beforeLoad");
      return;
    } else {
      clearAuth();
    }
  } catch (err) {
    console.debug("Session check failed", err);
    clearAuth();
  }

  // Recommendation 2: Use Router's location instead of global window.location
  // Recommendation 1: Throw redirect to move the guard to the Router layer
  throw redirect({
    to: navigateTo,
    search: {
      next: location.href,
    },
  });
}
