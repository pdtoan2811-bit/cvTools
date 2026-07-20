import { NextResponse } from "next/server";
import { findKnownLogo } from "@/lib/logo-library";
import { jsonRoute } from "@/lib/api";
import { publicUrlOrNull } from "@/lib/safe-url";

export const dynamic = "force-dynamic";
export const maxDuration = 20;

/**
 * GET /api/thumbnail?url=…&name=…
 *
 * Auto-resolves a logo for a product / project / client entry, in order:
 *   1. the known-logo library (assets already in this repo, e.g. Joy)
 *   2. og:image / twitter:image / apple-touch-icon on the page itself
 *   3. the site's favicon service
 * Returns `{ url, source }`, or 404 so the caller can fall back to a monogram
 * or a manual upload.
 *
 * Short links (bit.ly, …) are followed to their destination first.
 */

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36";

/** Pull the first matching attribute value out of a <meta>/<link> tag. */
function metaContent(html: string, patterns: RegExp[]): string | null {
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return m[1].trim();
  }
  return null;
}

async function fetchHtml(url: URL) {
  const res = await fetch(url, {
    redirect: "follow",
    headers: { "user-agent": UA, accept: "text/html,*/*" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return null;
  const type = res.headers.get("content-type") || "";
  if (!type.includes("html")) return { finalUrl: new URL(res.url), html: "" };
  // Only the <head> matters, and some pages are huge.
  const html = (await res.text()).slice(0, 250_000);
  return { finalUrl: new URL(res.url), html };
}

const faviconFor = (host: string) =>
  `https://www.google.com/s2/favicons?domain=${host}&sz=128`;

const INLINE_MAX_BYTES = 96 * 1024;

/**
 * Fetch a logo and hand it back as a data URL, so it becomes part of the CV
 * document rather than a hotlink to someone else's server. Anything too big to
 * embed comfortably falls back to its address.
 */
async function inline(imageUrl: string): Promise<string> {
  try {
    const res = await fetch(imageUrl, {
      headers: { "user-agent": UA },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return imageUrl;
    const type = (res.headers.get("content-type") || "").split(";")[0];
    if (!type.startsWith("image/")) return imageUrl;
    const buf = await res.arrayBuffer();
    if (buf.byteLength > INLINE_MAX_BYTES) return imageUrl;
    return `data:${type};base64,${Buffer.from(buf).toString("base64")}`;
  } catch {
    return imageUrl;
  }
}

export const GET = jsonRoute(async (req: Request) => {
  const params = new URL(req.url).searchParams;
  const rawUrl = params.get("url") || "";
  const name = params.get("name") || "";

  // 1. Known-logo library — an exact asset beats anything scraped.
  const known = findKnownLogo(name, rawUrl);
  if (known) {
    return NextResponse.json({ url: known.file, bg: known.bg, source: "library" });
  }

  const target = await publicUrlOrNull(rawUrl);
  if (!target) {
    return NextResponse.json({ error: "No logo found for that link" }, { status: 404 });
  }

  try {
    const page = await fetchHtml(target);
    const finalUrl = page?.finalUrl ?? target;

    // The short link may have resolved to a domain the library knows.
    const knownAfterRedirect = findKnownLogo(name, finalUrl.href);
    if (knownAfterRedirect) {
      return NextResponse.json({
        url: knownAfterRedirect.file,
        bg: knownAfterRedirect.bg,
        source: "library",
      });
    }

    // 2. Page metadata.
    const candidate = page?.html
      ? metaContent(page.html, [
          /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
          /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
          /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
          /<link[^>]+rel=["']apple-touch-icon[^"']*["'][^>]+href=["']([^"']+)["']/i,
          /<link[^>]+rel=["'][^"']*icon["'][^>]+href=["']([^"']+)["']/i,
        ])
      : null;

    if (candidate) {
      const abs = new URL(candidate, finalUrl);
      // A bare .ico is usually 16px — too small for a card. Ask the favicon
      // service for a 128px render of the same site instead.
      if (abs.pathname.toLowerCase().endsWith(".ico")) {
        return NextResponse.json({ url: await inline(faviconFor(abs.host)), source: "favicon" });
      }
      return NextResponse.json({ url: await inline(abs.href), source: "page" });
    }

    // 3. Favicon service on the resolved host.
    return NextResponse.json({ url: await inline(faviconFor(finalUrl.host)), source: "favicon" });
  } catch {
    return NextResponse.json({ error: "Could not resolve a logo" }, { status: 404 });
  }
});
