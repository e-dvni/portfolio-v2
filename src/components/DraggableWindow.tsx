import { useEffect, useMemo, useRef } from "react";
import { useUI } from "../state/uiStore";

export type WindowKey = "terminal" | "notes" | "admin";

type Props = {
  windowKey: WindowKey;
  defaultSize: { width: number; height: number };
  children: React.ReactNode;
  titleBar: (opts: { onPointerDown: (e: React.PointerEvent) => void }) => React.ReactNode;
};

type Pos = { x: number; y: number };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function DraggableWindow({ windowKey, defaultSize, titleBar, children }: Props) {
  const pos = useUI((s) => s.windowPos[windowKey]);
  const z = useUI((s) => s.windowZ[windowKey] ?? 10);
  const activeWindow = useUI((s) => s.activeWindow);

  const ensureWindow = useUI((s) => s.ensureWindow);
  const setWindowPos = useUI((s) => s.setWindowPos);
  const focusWindow = useUI((s) => s.focusWindow);

  const drag = useRef<{
    active: boolean;
    dx: number;
    dy: number;
    key: WindowKey;
    size: { width: number; height: number };
  }>({
    active: false,
    dx: 0,
    dy: 0,
    key: windowKey,
    size: defaultSize,
  });

  const fallback: Pos = useMemo(() => {
    const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    return {
      x: Math.round((vw - defaultSize.width) / 2),
      y: Math.round((vh - defaultSize.height) / 2) - 30,
    };
  }, [defaultSize.height, defaultSize.width]);

  useEffect(() => {
    ensureWindow(windowKey, fallback);
  }, [ensureWindow, windowKey, fallback]);

  // Global drag listeners so dragging doesn't "drop" when pointer leaves the title bar/window
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!drag.current.active) return;

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const nextX = e.clientX - drag.current.dx;
      const nextY = e.clientY - drag.current.dy;

      const margin = 8;
      const maxX = vw - drag.current.size.width - margin;
      const maxY = vh - drag.current.size.height - margin;

      setWindowPos(drag.current.key, {
        x: clamp(nextX, margin, Math.max(margin, maxX)),
        y: clamp(nextY, margin, Math.max(margin, maxY)),
      });
    };

    const onUp = () => {
      drag.current.active = false;
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [setWindowPos]);

  const onPointerDown = (e: React.PointerEvent) => {
    focusWindow(windowKey);
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);

    const current = (pos ?? fallback) as Pos;

    drag.current.active = true;
    drag.current.key = windowKey;
    drag.current.size = defaultSize;
    drag.current.dx = e.clientX - current.x;
    drag.current.dy = e.clientY - current.y;
  };

  const current: Pos = (pos ?? fallback) as Pos;
  const isActive = activeWindow === windowKey;

  return (
    <div
      data-window="true"
      onPointerDown={() => focusWindow(windowKey)}
      style={{
        position: "absolute",
        left: current.x,
        top: current.y,
        width: defaultSize.width,
        height: defaultSize.height,
        zIndex: z,

        // Solid window base
        background: "var(--panelSolid)",
        border: "1px solid var(--border)",
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: "var(--shadow)",

        // Active/inactive dim (no opacity)
        filter: isActive ? "none" : "brightness(0.94) saturate(0.96)",
        transform: "translateZ(0)",
        transition: "filter 120ms ease",
      }}
    >
      {titleBar({ onPointerDown })}
      {children}
    </div>
  );
}
