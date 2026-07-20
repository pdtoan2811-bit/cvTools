import type { CvData } from "./types";

/**
 * The working copy lives in the browser.
 *
 * That is what makes the app usable the moment it is deployed: no store to
 * provision, no record to create, no key to keep. Edits survive a reload, and
 * sharing is a link rather than a database row.
 */

const KEY = "cvtools:working-copy";

export function loadLocal(): CvData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CvData;
    return parsed && typeof parsed.name === "string" ? parsed : null;
  } catch {
    return null;
  }
}

export function saveLocal(data: CvData): { ok: true } | { ok: false; error: string } {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
    return { ok: true };
  } catch (e) {
    // Usually the ~5 MB quota, hit by pasting large images into the document.
    const quota = e instanceof DOMException && (e.name === "QuotaExceededError" || e.code === 22);
    return {
      ok: false,
      error: quota
        ? "This browser's storage is full — the images in this CV are too large. Download a JSON backup, then replace the biggest images."
        : "Could not save to this browser's storage.",
    };
  }
}

export function clearLocal() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* nothing to do */
  }
}
