import { useEffect } from "react";
import { useUI } from "../state/uiStore";
import DesktopShell from "../shell/DesktopShell";
import { bindGlobalShortcuts } from "../system/shortcuts";
import { readLaunchpadSlugFromURL } from "../system/urlSync";
import { runCommand } from "../system/commands";

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  useEffect(() => {
    const anyKey = () => onLogin();
    window.addEventListener("keydown", anyKey, { once: true });
    return () => window.removeEventListener("keydown", anyKey);
  }, [onLogin]);

  return (
    <div
      onMouseDown={onLogin}
      style={{
        height: "100vh",
        width: "100vw",
        display: "grid",
        placeItems: "center",
        background:
          "radial-gradient(1200px 700px at 30% 30%, rgba(154,208,255,0.35), transparent 60%), radial-gradient(900px 600px at 70% 40%, rgba(99,102,241,0.28), transparent 55%), radial-gradient(900px 700px at 50% 80%, rgba(16,185,129,0.18), transparent 55%), linear-gradient(180deg, rgba(5,8,16,1), rgba(10,15,26,1))",
      }}
    >
      <div style={{ textAlign: "center", animation: "fadeIn 250ms ease-out" }}>
        <div
          style={{
            width: 112,
            height: 112,
            borderRadius: 999,
            margin: "0 auto 14px",
            background: "rgba(255,255,255,0.10)",
            border: "1px solid rgba(255,255,255,0.18)",
            boxShadow: "0 30px 90px rgba(0,0,0,0.55)",
            display: "grid",
            placeItems: "center",
            fontSize: 34,
            userSelect: "none",
          }}
          title="Edvni"
        >
          {/* TODO: replace with your logo image */}
          e
        </div>

        <div style={{ fontSize: 18, letterSpacing: 0.2, marginBottom: 10 }}>edvni</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>
          Click anywhere or press any key
        </div>
      </div>
    </div>
  );
}

export default function AppRoot() {
  const isLoggedIn = useUI((s) => s.isLoggedIn);
  const theme = useUI((s) => s.theme);
  const login = useUI((s) => s.login);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => bindGlobalShortcuts(), []);

  useEffect(() => {
    // If user landed on /lp/:slug, open launchpad after login
    const slug = readLaunchpadSlugFromURL();
    if (slug && isLoggedIn) runCommand({ type: "OPEN_LAUNCHPAD", slug });
  }, [isLoggedIn]);

  if (!isLoggedIn) return <LoginScreen onLogin={login} />;
  return <DesktopShell />;
}
