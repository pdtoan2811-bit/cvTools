import "server-only";
import { getCv } from "./store";

/**
 * Who is allowed to write.
 *
 * There are no accounts. Two credentials exist:
 *   ADMIN_TOKEN  — the deployment owner, used to create CVs and list edit links
 *   editKey      — per-CV, lives in the /edit link, allows editing that one CV
 *
 * Everything that costs storage is behind one of them, otherwise a public URL
 * lets strangers fill the Blob store.
 */

export const adminToken = () => process.env.ADMIN_TOKEN || "";

/** True when the request carries the deployment's admin token. */
export function isAdmin(req: Request): boolean {
  const token = adminToken();
  if (!token) return false;
  const url = new URL(req.url);
  const given = req.headers.get("x-admin-token") || url.searchParams.get("admin") || "";
  return given === token;
}

/**
 * Creating a CV requires the admin token — but only once one is configured.
 * An unset ADMIN_TOKEN keeps a fresh deployment usable out of the box; the
 * README tells you to set it before sharing the URL.
 */
export function canCreate(req: Request): boolean {
  return adminToken() ? isAdmin(req) : true;
}

/**
 * Uploads and logo lookups happen while editing a specific CV, so they are
 * authorised by that CV's edit key — `?cv=<id>&k=<editKey>` — or by admin.
 */
export async function hasEditSession(req: Request): Promise<boolean> {
  if (isAdmin(req)) return true;
  const url = new URL(req.url);
  const id = url.searchParams.get("cv") || "";
  const key = req.headers.get("x-edit-key") || url.searchParams.get("k") || "";
  if (!id || !key) return false;
  const record = await getCv(id);
  return Boolean(record) && record!.editKey === key;
}

export const FORBIDDEN = {
  error:
    "Not allowed. Open this CV through its editor link, which carries the edit key.",
};
