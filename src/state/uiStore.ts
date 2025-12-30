import { create } from "zustand";

export type ThemeMode = "light" | "dark";

type UIState = {
  isLoggedIn: boolean;
  theme: ThemeMode;

  // Launchpad
  launchpadOpen: boolean;
  launchpadSlug: string;

  // Spotlight
  spotlightOpen: boolean;

  // Dock running indicators
  running: Record<string, boolean>;

  // Admin
  isAdmin: boolean;

  // Actions
  login: () => void;
  setTheme: (t: ThemeMode) => void;
  toggleTheme: () => void;

  openLaunchpad: (slug?: string) => void;
  closeLaunchpad: () => void;

  openSpotlight: () => void;
  closeSpotlight: () => void;
  toggleSpotlight: () => void;

  setRunning: (key: string, on: boolean) => void;
};

const THEME_KEY = "edvni.theme";
const LAST_SLUG_KEY = "edvni.lastSlug";

const getStoredTheme = (): ThemeMode => {
  const t = localStorage.getItem(THEME_KEY);
  return t === "light" || t === "dark" ? t : "dark";
};

const getStoredSlug = (): string => localStorage.getItem(LAST_SLUG_KEY) || "about";

export const useUI = create<UIState>((set, get) => ({
  isLoggedIn: false,
  theme: typeof window !== "undefined" ? getStoredTheme() : "dark",

  isAdmin: false,

  launchpadOpen: false,
  launchpadSlug: typeof window !== "undefined" ? getStoredSlug() : "about",

  spotlightOpen: false,

  running: { launchpad: false, notes: false, admin: false, terminal: false, spotlight: false },

  login: () => set({ isLoggedIn: true }),

  setTheme: (t) => {
    localStorage.setItem(THEME_KEY, t);
    set({ theme: t });
  },
  toggleTheme: () => {
    const next: ThemeMode = get().theme === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, next);
    set({ theme: next });
  },

  openLaunchpad: (slug) => {
    const active = slug || get().launchpadSlug || "about";
    localStorage.setItem(LAST_SLUG_KEY, active);
    set((s) => ({
      launchpadOpen: true,
      launchpadSlug: active,
      running: { ...s.running, launchpad: true },
    }));
  },
  closeLaunchpad: () =>
    set((s) => ({
      launchpadOpen: false,
      running: { ...s.running, launchpad: false },
    })),

  openSpotlight: () =>
    set((s) => ({
      spotlightOpen: true,
      running: { ...s.running, spotlight: true },
    })),
  closeSpotlight: () =>
    set((s) => ({
      spotlightOpen: false,
      running: { ...s.running, spotlight: false },
    })),
  toggleSpotlight: () => (get().spotlightOpen ? get().closeSpotlight() : get().openSpotlight()),

  setRunning: (key, on) => set((s) => ({ running: { ...s.running, [key]: on } })),
}));
