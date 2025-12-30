import { create } from "zustand";

export type ThemeMode = "light" | "dark";

type WindowKey = "terminal" | "notes" | "admin";

type WindowPos = { x: number; y: number };

type UIState = {
  isLoggedIn: boolean;
  theme: ThemeMode;

  // Launchpad
  launchpadOpen: boolean;
  launchpadSlug: string;

  // Spotlight
  spotlightOpen: boolean;

  // Terminal
  terminalOpen: boolean;

  // Dock running indicators
  running: Record<string, boolean>;

  // Admin
  isAdmin: boolean;

  // --- Window System (for draggable windows only)
  windowPos: Partial<Record<WindowKey, WindowPos>>;
  windowZ: Partial<Record<WindowKey, number>>;
  topZ: number;

  focusWindow: (key: WindowKey) => void;
  setWindowPos: (key: WindowKey, pos: WindowPos) => void;
  ensureWindow: (key: WindowKey, fallback: WindowPos) => void;

  // Actions
  login: () => void;
  setTheme: (t: ThemeMode) => void;
  toggleTheme: () => void;

  openLaunchpad: (slug?: string) => void;
  closeLaunchpad: () => void;

  openSpotlight: () => void;
  closeSpotlight: () => void;
  toggleSpotlight: () => void;

  openTerminal: () => void;
  closeTerminal: () => void;
  toggleTerminal: () => void;

  setRunning: (key: string, on: boolean) => void;
};

const THEME_KEY = "edvni.theme";
const LAST_SLUG_KEY = "edvni.lastSlug";

// optional persistence for window positions
const WIN_POS_KEY = "edvni.windowPos";

const getStoredTheme = (): ThemeMode => {
  const t = localStorage.getItem(THEME_KEY);
  return t === "light" || t === "dark" ? t : "dark";
};

const getStoredSlug = (): string => localStorage.getItem(LAST_SLUG_KEY) || "about";

const readWindowPos = (): UIState["windowPos"] => {
  try {
    const raw = localStorage.getItem(WIN_POS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const writeWindowPos = (pos: UIState["windowPos"]) => {
  try {
    localStorage.setItem(WIN_POS_KEY, JSON.stringify(pos));
  } catch {
    // ignore
  }
};

export const useUI = create<UIState>((set, get) => ({
  isLoggedIn: false,
  theme: typeof window !== "undefined" ? getStoredTheme() : "dark",

  isAdmin: false,

  launchpadOpen: false,
  launchpadSlug: typeof window !== "undefined" ? getStoredSlug() : "about",

  spotlightOpen: false,
  terminalOpen: false,

  running: {
    launchpad: false,
    terminal: false,
    notes: false,
    admin: false,
    spotlight: false,
  },

  // window system defaults
  windowPos: typeof window !== "undefined" ? readWindowPos() : {},
  windowZ: { terminal: 10, notes: 11, admin: 12 },
  topZ: 20,

  focusWindow: (key) =>
    set((s) => {
      const nextTop = s.topZ + 1;
      return {
        topZ: nextTop,
        windowZ: { ...s.windowZ, [key]: nextTop },
      };
    }),

  setWindowPos: (key, pos) =>
    set((s) => {
      const next = { ...s.windowPos, [key]: pos };
      if (typeof window !== "undefined") writeWindowPos(next);
      return { windowPos: next };
    }),

  ensureWindow: (key, fallback) =>
    set((s) => {
      if (s.windowPos[key]) return {};
      const next = { ...s.windowPos, [key]: fallback };
      if (typeof window !== "undefined") writeWindowPos(next);
      return { windowPos: next };
    }),

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

  openTerminal: () =>
    set((s) => ({
      terminalOpen: true,
      running: { ...s.running, terminal: true },
    })),
  closeTerminal: () =>
    set((s) => ({
      terminalOpen: false,
      running: { ...s.running, terminal: false },
    })),
  toggleTerminal: () => (get().terminalOpen ? get().closeTerminal() : get().openTerminal()),

  setRunning: (key, on) => set((s) => ({ running: { ...s.running, [key]: on } })),
}));
