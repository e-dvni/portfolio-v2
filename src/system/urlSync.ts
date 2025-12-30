export function setURLForLaunchpadOpen() {
  window.history.pushState({}, "", "/lp");
}

export function clearURLToRoot() {
  window.history.pushState({}, "", "/");
}

export function isLaunchpadURL(): boolean {
  return window.location.pathname === "/lp";
}
