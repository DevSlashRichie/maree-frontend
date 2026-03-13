import { Navigate } from "@tanstack/react-router";
import type React from "react";
import { useEffect, useState } from "react";
import { getV1UsersMe } from "@/lib/api";
import { sessionEvents } from "@/lib/sessionEvents";
import { useAuthStore } from "./use-auth-store";

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
): React.FC<P> {
  return function WithAuthComponent(props: P) {
    const { isAuthenticated, setAuth, clearAuth, isInDev } = useAuthStore();
    const [isChecking, setIsChecking] = useState(true);
    const [wasAuthenticated, setWasAuthenticated] = useState(isAuthenticated);

    useEffect(() => {
      const checkSession = async () => {
        // Track if user was authenticated at some point
        if (isAuthenticated) {
          setWasAuthenticated(true);
          setIsChecking(false);
          return;
        }

        try {
          const { data: user, status } = await getV1UsersMe();

          if (user && status === 200) {
            setAuth(user);
            setWasAuthenticated(true);
          } else {
            // No valid session
            clearAuth();

            // Only show modal if user was previously authenticated
            // Otherwise they never logged in and should be redirected
            if (wasAuthenticated) {
              sessionEvents.emitSessionExpired();
            }
          }
        } catch (err) {
          console.debug("Session check failed", err);
          clearAuth();

          // Only show modal if user was previously authenticated
          if (wasAuthenticated) {
            sessionEvents.emitSessionExpired();
          }
        } finally {
          setIsChecking(false);
        }
      };

      if (!isInDev) checkSession();
    }, [isAuthenticated, setAuth, clearAuth, wasAuthenticated, isInDev]);

    if (isInDev) {
      return <Component {...props} />;
    }

    if (isChecking) {
      return (
        <div className="flex items-center justify-center h-screen">
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      );
    }

    // If not authenticated and never was authenticated, redirect to home
    if (!isAuthenticated && !wasAuthenticated) {
      return <Navigate to="/" replace />;
    }

    // If not authenticated but was authenticated before, show component
    // (SessionExpiredModal will handle the popup)
    return <Component {...props} />;
  };
}
