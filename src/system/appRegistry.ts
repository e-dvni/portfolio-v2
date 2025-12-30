export type AppKey = "launchpad" | "notes" | "github" | "linkedin" | "mail" | "admin";

export type DockApp = {
  key: AppKey;
  name: string;
  kind: "overlay" | "external" | "window";
  href?: string; // for external
};

export const DOCK_APPS: DockApp[] = [
  { key: "launchpad", name: "Launchpad", kind: "overlay" },
  { key: "notes", name: "Notes", kind: "window" },
  { key: "github", name: "GitHub", kind: "external", href: "https://github.com/e-dvni/" },
  { key: "linkedin", name: "LinkedIn", kind: "external", href: "https://www.linkedin.com/in/daniel-lee-7157a31a8/" },
  { key: "mail", name: "Mail", kind: "external" },
  { key: "admin", name: "Admin CMS", kind: "window" },
];
