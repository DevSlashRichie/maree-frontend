import { create } from "zustand";
import { postAuthLogout } from "@/lib/api";
import type { Actor } from "@/lib/schemas";

// only enable when required.
const IS_DEV = import.meta.env.VITE_DISABLE_AUTH === "true";

interface AuthState {
  actor: Actor | null;
  isAuthenticated: boolean;
  setAuth: (actor: Actor) => void;
  clearAuth: () => void;
  login: (role?: "administrator") => void;
  logout: () => Promise<void>;
  isInDev: boolean;
}

export const useAuthStore = create<AuthState>()((set) => ({
  actor: null,
  isAuthenticated: false,
  setAuth: (actor) => set({ actor, isAuthenticated: true }),
  clearAuth: () => set({ actor: null, isAuthenticated: false }),
  login: () => {
    window.location.href = "/login";
  },
  logout: async () => {
    // Clear local state
    set({ actor: null, isAuthenticated: false });
    await postAuthLogout();

    window.location.href = "/";
  },
  isInDev: IS_DEV,
}));
