import { create } from "zustand";
import type { Actor } from "@/lib/schemas";
import toast from "react-hot-toast";

// only enable when required.
const IS_DEV = import.meta.env.VITE_DISABLE_AUTH === "true";

interface AuthState {
  actor: Actor | null;
  isAuthenticated: boolean;
  expiresAt: string | null;
  isInitialChecked: boolean;
  setAuth: (actor: Actor, expiresAt?: string) => void;
  clearAuth: () => void;
  setInitialChecked: () => void;
  checkSession: () => boolean;
  isInDev: boolean;
}

const SESSION_EXPIRY_KEY = "maree_session_expiry";

export const useAuthStore = create<AuthState>()((set, get) => ({
  actor: null,
  isAuthenticated: false,
  expiresAt: localStorage.getItem(SESSION_EXPIRY_KEY),
  isInitialChecked: false,
  setAuth: (actor, expiresAt) => {
    if (expiresAt) {
      localStorage.setItem(SESSION_EXPIRY_KEY, expiresAt);
    }

    set({
      actor,
      isAuthenticated: true,
      expiresAt: expiresAt || localStorage.getItem(SESSION_EXPIRY_KEY) || null,
      isInitialChecked: true,
    });
  },
  clearAuth: () => {
    localStorage.removeItem(SESSION_EXPIRY_KEY);

    set({
      actor: null,
      isAuthenticated: false,
      expiresAt: null,
      isInitialChecked: true,
    });
  },
  setInitialChecked: () => set({ isInitialChecked: true }),
  checkSession: () => {
    const { expiresAt, isAuthenticated, clearAuth } = get();
    if (!expiresAt) return isAuthenticated;

    const expiryDate = new Date(expiresAt);
    if (expiryDate <= new Date()) {
      console.info("Session expired based on expiresAt");
      toast.error("Sesión expirada.");
      clearAuth();
      return false;
    }

    return isAuthenticated;
  },
  isInDev: IS_DEV,
}));
