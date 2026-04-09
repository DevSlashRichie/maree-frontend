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
  navigateTo = "/login",
}: {
  location: { href: string };
  navigateTo?: string;
}) {
  const {
    isAuthenticated,
    setAuth,
    clearAuth,
    isInDev,
    checkSession,
    expiresAt,
    isInitialChecked,
    setInitialChecked,
  } = useAuthStore.getState();

  // Recommendation 6: Keep Dev Environment Bypass (Intentionally bypassing in dev)
  if (isInDev) {
    return;
  }

  // Check locally stored session expiration
  if (isAuthenticated) {
    if (checkSession()) {
      return;
    }
  }

  // If we haven't checked the session yet (e.g., direct link entry), try now
  if (!isInitialChecked) {
    try {
      const { data: user, status } = await getV1UsersMe();

      if (user && status === 200) {
        setAuth(user);
        console.info("Session validated via initial check in beforeLoad");
        return;
      }
    } catch (err) {
      console.debug("Initial session check failed", err);
    } finally {
      setInitialChecked();
    }
  }

  try {
    const { data: user, status } = await getV1UsersMe();

    if (user && status === 200) {
      // Note: We don't have the expiresAt here from getV1UsersMe usually
      // but we update the actor.
      setAuth(user, expiresAt || undefined);
      console.info("Session validated via beforeLoad");
      return;
    } else {
      clearAuth();
    }
  } catch (err) {
    console.debug("Session check failed", err);
    clearAuth();
  }

  throw redirect({
    to: navigateTo,
    search: {
      next: location.href,
    },
  });
}
