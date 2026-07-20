import { findKnownLogo } from "./logo-library";
import type { Project } from "./types";

export { ICONS, COLORS } from "./icon-data";

/** Map a free-text skill / tool name to an icon key. */
export function skillIcon(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("claude") || n.includes("anthropic")) return "claude";
  if (n.includes("github")) return "github";
  if (n.includes("data studio") || n.includes("looker")) return "datastudio";
  if (n.includes("big query") || n.includes("bigquery") || n.includes("sql")) return "bigquery";
  if (n.includes("hubspot")) return "hubspot";
  if (n.includes("firebase")) return "firebase";
  if (n.includes("figma")) return "figma";
  if (n.includes("python")) return "python";
  if (n.includes("photoshop") || n.includes("adobe")) return "photoshop";
  if (n.includes("shopify")) return "shopify";
  if (n.includes("email")) return "mail";
  if (n.includes("automation")) return "flow";
  if (n.includes("analysis") || n.includes("analytic")) return "chart";
  if (n.includes("copywriting") || n.includes("writing") || n.includes("content")) return "pen";
  if (n.includes("onboarding") || n.includes("customer") || n.includes("account")) return "user";
  if (n.includes("sales") || n.includes("partnership") || n.includes("upsell")) return "bag";
  if (n.includes("insider") || n.includes(".com") || n.includes("http")) return "globe";
  return "sparkle";
}

/** Real (full-color) brand logo file for a skill, when the library has one. */
export function skillLogo(name: string): string | null {
  return findKnownLogo(name)?.file ?? null;
}

/** Map a project (by url/name) to a brand icon key. */
export function projectIcon(p: Pick<Project, "url" | "name">): string {
  const s = `${p.url || ""} ${p.name || ""}`.toLowerCase();
  if (s.includes("shopify")) return "shopify";
  if (s.includes("medium")) return "medium";
  if (s.includes("youtube") || s.includes("youtu.be")) return "image";
  if (s.includes("twitter") || s.includes("/x.com")) return "x";
  if (s.includes("linkedin")) return "linkedin";
  if (s.includes("github")) return "github";
  return "globe";
}

/** Icon key for a free-form link URL. */
export function linkIcon(url: string): string {
  if (/linkedin/i.test(url)) return "linkedin";
  if (/twitter|x\.com/i.test(url)) return "x";
  if (/medium/i.test(url)) return "medium";
  if (/github/i.test(url)) return "github";
  return "link";
}
