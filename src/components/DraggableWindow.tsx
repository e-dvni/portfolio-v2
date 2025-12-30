import { useEffect, useMemo, useRef } from "react";
import { useUI } from "../state/uiStore";

type WindowKey = "terminal" | "notes" | "admin";

type Props = {
  windowKey: WindowKey;
  defaultSize: { width: number; height: number };
  children: React.ReactNode;

  /** element that starts dragging: usually your title bar */
  titleBar: (opts: {
    onPointerDown: (e: React.PointerEvent) => void;
  }) => React.ReactNode;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function DraggableWindow({ windowKey, defaultSize, titleBar, children }: Props) {
  const pos = useUI((s) => s.windowPos[windowKey]);
  const z = useUI((s) => s.windowZ[windowKey] ?? 10);
  const ensureWindow = useUI((s) => s.ensureWindow);
  const setWindowPos = useUI((s) => s.setWindowPos);
  const focusWindow = useUI((s) => s.focusWindow);

  const drag = useRef<{
    active: boolean;
    dx: number;
    dy: number;
  }>({ active: false, dx: 0, dy: 0 });

  // center fallback (only computed once per mount)
  const fallback = useMemo(() => {
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

  const onPointerDown = (e: React.PointerEvent) => {
    // bring to front and start dragging
    focusWindow(windowKey);

    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture?.(e.pointerId);

    const current = pos ?? fallback;

    drag.current.active = true;
    drag.current.dx = e.clientX - current.x;
    drag.current.dy = e.clientY - current.y;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const nextX = e.clientX - drag.current.dx;
    const nextY = e.clientY - drag.current.dy;

    // keep window inside viewport with a small margin
    const margin = 8;
    const maxX = vw - defaultSize.width - margin;
    const maxY = vh - defaultSize.height - margin;

    setWindowPos(windowKey, {
      x: clamp(nextX, margin, Math.max(margin, maxX)),
      y: clamp(nextY, margin, Math.max(margin, maxY)),
    });
  };

  const onPointerUp = () => {
    drag.current.active = false;
  };

  const current = pos ?? fallback;

  return (
    <div
      style={{
        position: "absolute",
        left: current.x,
        top: current.y,
        width: defaultSize.width,
        height: defaultSize.height,
        zIndex: z,
      }}
      onMouseDown={() => focusWindow(windowKey)}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {titleBar({ onPointerDown })}
      {children}
    </div>
  );
}
