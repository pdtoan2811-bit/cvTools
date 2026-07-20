/**
 * Known-logo library — step 1 of thumbnail resolution.
 *
 * Seeded from the original CV (`cv-data.js` + the `logos/` folder), so an entry
 * that names the same product or company as Toan's CV reuses that exact asset
 * instead of scraping a favicon. Minh sells Joy / Joy Subscription, so those
 * hit here directly.
 *
 * Matching is on the entry's name AND its URL's hostname, both lowercased.
 */

export type LogoEntry = {
  /** Path under /public. */
  file: string;
  /** Substrings matched against the entry name (lowercased). */
  names: string[];
  /** Hostname substrings matched against the entry URL. */
  hosts?: string[];
  /** Background to sit the mark on, for logos that need one. */
  bg?: string;
};

export const LOGO_LIBRARY: LogoEntry[] = [
  { file: "/logos/joy-subscription.png", names: ["joy subscription", "joy sub"], hosts: ["apps.shopify.com/joy-subscription"] },
  { file: "/logos/joy.png", names: ["joy loyalty", "joy ultimate", "joy wishlist", "joy"], hosts: ["apps.shopify.com/joyio", "joy.so"] },
  { file: "/logos/chatty.png", names: ["chatty"], hosts: ["apps.shopify.com/chatty"] },
  { file: "/logos/shopvid.png", names: ["shopvid"], hosts: ["apps.shopify.com/shopvid"] },
  { file: "/logos/adecos.png", names: ["adecos"], hosts: ["adecos.ai"] },
  { file: "/logos/tocco.png", names: ["tocco"], hosts: ["tocco.earth"], bg: "#000" },
  { file: "/logos/clients/allbirds.jpg", names: ["allbirds"], hosts: ["allbirds.co.kr", "allbirds.com"] },
  { file: "/logos/clients/vinamilk.svg", names: ["vinamilk"], hosts: ["vinamilk.com.vn"] },
  { file: "/logos/clients/tinselrack.png", names: ["tinsel rack", "tinselrack"], hosts: ["thetinselrack.com"] },
  { file: "/logos/clients/koreanskincare.png", names: ["korean skincare"], hosts: ["koreanskincare.com"] },
  { file: "/logos/clients/glamourus.png", names: ["glamour us", "glamourus"], hosts: ["glamourusus.com"] },
  { file: "/logos/skills/bigquery.svg", names: ["bigquery", "big query"] },
  { file: "/logos/skills/firebase.svg", names: ["firebase"] },
  { file: "/logos/skills/figma.svg", names: ["figma"] },
  { file: "/logos/skills/python.svg", names: ["python"] },
  { file: "/logos/skills/hubspot.svg", names: ["hubspot"] },
];

const hostOf = (url?: string) => {
  if (!url) return "";
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).host.replace(/^www\./, "");
  } catch {
    return "";
  }
};

/**
 * Look up a known logo by entry name and/or URL. Returns null when nothing in
 * the library matches — the caller then falls back to favicon scraping.
 */
export function findKnownLogo(name?: string, url?: string): LogoEntry | null {
  const n = (name || "").toLowerCase().trim();
  const host = hostOf(url);
  const path = (url || "").toLowerCase();

  for (const entry of LOGO_LIBRARY) {
    if (entry.hosts?.some((h) => (h.includes("/") ? path.includes(h) : host.includes(h)))) {
      return entry;
    }
  }
  if (!n) return null;
  for (const entry of LOGO_LIBRARY) {
    if (entry.names.some((cand) => n.includes(cand))) return entry;
  }
  return null;
}
