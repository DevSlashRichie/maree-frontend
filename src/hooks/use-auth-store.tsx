import { create } from "zustand";
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
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    window.location.href = `${baseUrl}/auth/v1/login`;
  },
  logout: async () => {
    // Clear local state
    set({ actor: null, isAuthenticated: false });

    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    window.location.href = `${baseUrl}/auth/v1/logout`;
  },
  isInDev: IS_DEV,
}));
