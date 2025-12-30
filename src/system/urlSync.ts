export function setURLForLaunchpad(slug: string) {
  const path = `/lp/${encodeURIComponent(slug)}`;
  window.history.pushState({}, "", path);
}

export function clearURLToRoot() {
  window.history.pushState({}, "", "/");
}

export function readLaunchpadSlugFromURL(): string | null {
  const m = window.location.pathname.match(/^\/lp\/(.+)$/);
  if (!m) return null;
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return m[1];
  }
}
