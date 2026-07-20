import { lookup } from "node:dns/promises";

/**
 * Guard for URLs the server fetches on a caller's behalf.
 *
 * /api/thumbnail follows a user-supplied link, which without a check makes the
 * deployment a proxy into anything its network can reach — cloud metadata
 * endpoints (169.254.169.254) and private ranges most of all. Hostnames are
 * resolved before fetching, because a public name can point at a private
 * address.
 */

const BLOCKED_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1", "metadata.google.internal"]);

/** RFC1918, loopback, link-local, CGNAT, and their IPv6 equivalents. */
function isPrivateAddress(ip: string): boolean {
  if (ip.includes(":")) {
    const v6 = ip.toLowerCase();
    if (v6 === "::1" || v6 === "::") return true;
    if (v6.startsWith("fc") || v6.startsWith("fd")) return true; // unique local
    if (v6.startsWith("fe80")) return true; // link-local
    // IPv4-mapped, e.g. ::ffff:10.0.0.1
    const mapped = v6.match(/::ffff:(\d+\.\d+\.\d+\.\d+)/);
    if (mapped) return isPrivateAddress(mapped[1]);
    return false;
  }
  const p = ip.split(".").map(Number);
  if (p.length !== 4 || p.some((n) => Number.isNaN(n))) return true;
  const [a, b] = p;
  if (a === 10 || a === 127 || a === 0) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 169 && b === 254) return true; // link-local + cloud metadata
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  if (a >= 224) return true; // multicast / reserved
  return false;
}

/**
 * Resolves `raw` and returns it only if it is a public http(s) address.
 * Returns null when it should not be fetched.
 */
export async function publicUrlOrNull(raw: string): Promise<URL | null> {
  let url: URL;
  try {
    url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  if (BLOCKED_HOSTS.has(host) || host.endsWith(".local") || host.endsWith(".internal")) return null;
  if (isPrivateAddress(host)) return null; // literal IP in the URL

  try {
    const results = await lookup(host, { all: true });
    if (results.length === 0) return null;
    if (results.some((r) => isPrivateAddress(r.address))) return null;
  } catch {
    return null;
  }
  return url;
}
