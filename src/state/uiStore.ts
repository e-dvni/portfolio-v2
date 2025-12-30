import { create } from "zustand";

export type ThemeMode = "light" | "dark";
export type WindowKey = "terminal" | "notes" | "admin";

type WindowPos = { x: number; y: number };

type UIState = {
  isLoggedIn: boolean;
  theme: ThemeMode;

  // Launchpad
  launchpadOpen: boolean;
  launchpadSlug: string;

  // Spotlight
  spotlightOpen: boolean;

  // Windows
  terminalOpen: boolean;
  notesOpen: boolean;

  // Single source of truth for focus
  activeWindow: WindowKey | null;
  clearActiveWindow: () => void;

  // Dock running indicators
  running: Record<string, boolean>;

  // Admin
  isAdmin: boolean;

  // Window system
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

  openNotes: () => void;
  closeNotes: () => void;
  toggleNotes: () => void;

  closeFocusedWindow: () => void;

  setRunning: (key: string, on: boolean) => void;
};

const THEME_KEY = "edvni.theme";
const LAST_SLUG_KEY = "edvni.lastSlug";
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
  notesOpen: false,

  activeWindow: null,
  clearActiveWindow: () => set({ activeWindow: null }),

  running: {
    launchpad: false,
    terminal: false,
    notes: false,
    admin: false,
    spotlight: false,
  },

  windowPos: typeof window !== "undefined" ? readWindowPos() : {},
  windowZ: { terminal: 10, notes: 11, admin: 12 },
  topZ: 20,

  focusWindow: (key) =>
    set((s) => {
      const nextTop = s.topZ + 1;
      return {
        topZ: nextTop,
        activeWindow: key,
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

  // Atomic open + focus + z-index
  openTerminal: () =>
    set((s) => {
      const nextTop = s.topZ + 1;
      return {
        terminalOpen: true,
        running: { ...s.running, terminal: true },
        topZ: nextTop,
        activeWindow: "terminal",
        windowZ: { ...s.windowZ, terminal: nextTop },
      };
    }),

  closeTerminal: () =>
    set((s) => ({
      terminalOpen: false,
      activeWindow: s.activeWindow === "terminal" ? null : s.activeWindow,
      running: { ...s.running, terminal: false },
    })),

  toggleTerminal: () => (get().terminalOpen ? get().closeTerminal() : get().openTerminal()),

  // Atomic open + focus + z-index
  openNotes: () =>
    set((s) => {
      const nextTop = s.topZ + 1;
      return {
        notesOpen: true,
        running: { ...s.running, notes: true },
        topZ: nextTop,
        activeWindow: "notes",
        windowZ: { ...s.windowZ, notes: nextTop },
      };
    }),

  closeNotes: () =>
    set((s) => ({
      notesOpen: false,
      activeWindow: s.activeWindow === "notes" ? null : s.activeWindow,
      running: { ...s.running, notes: false },
    })),

  toggleNotes: () => (get().notesOpen ? get().closeNotes() : get().openNotes()),

  closeFocusedWindow: () => {
    const ui = get();
    const key = ui.activeWindow;
    if (!key) return;

    if (key === "terminal") ui.closeTerminal();
    if (key === "notes") ui.closeNotes();
    if (key === "admin") {
      // later: closeAdmin()
    }
  },

  setRunning: (key, on) => set((s) => ({ running: { ...s.running, [key]: on } })),
}));
