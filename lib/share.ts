import type { CvData } from "./types";

/**
 * Share links carry the whole CV in the URL fragment.
 *
 * The fragment is never sent to a server, so a shared CV needs no database and
 * no account — and a document holding someone's phone number and email never
 * touches request logs or a Referer header on the way.
 *
 * gzip via CompressionStream keeps it small (Minh's CV: ~9 KB of JSON → ~3 KB
 * of link) and costs no dependency.
 */

const toBase64Url = (bytes: Uint8Array) => {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const fromBase64Url = (text: string) => {
  const b64 = text.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream) {
  const buf = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buf).set(bytes);
  const out = new Response(new Blob([buf]).stream().pipeThrough(stream as never));
  return new Uint8Array(await out.arrayBuffer());
}

export async function encodeCv(data: CvData): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(data));
  const gz = await pipe(json, new CompressionStream("gzip"));
  return toBase64Url(gz);
}

export async function decodeCv(payload: string): Promise<CvData | null> {
  try {
    const gz = fromBase64Url(payload);
    const json = await pipe(gz, new DecompressionStream("gzip"));
    const parsed = JSON.parse(new TextDecoder().decode(json)) as CvData;
    return parsed && typeof parsed.name === "string" ? parsed : null;
  } catch {
    return null;
  }
}

/** Reads a `#cv=…` payload from the current URL, if there is one. */
export function payloadFromHash(): string | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  return params.get("cv");
}

/**
 * Long URLs still work in browsers, but chat apps and email clients start
 * mangling them past a few thousand characters.
 */
export const LINK_COMFORTABLE_MAX = 12000;
