import "server-only";
import { head, list, put } from "@vercel/blob";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { CvData, CvRecord } from "./types";

/**
 * CV persistence.
 *
 * On Vercel, records live in Blob as `cv/<id>.json`. Without a
 * BLOB_READ_WRITE_TOKEN (i.e. plain `npm run dev` with no cloud setup) it falls
 * back to a gitignored `.data/` folder so the app is usable offline.
 */

const hasBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const DATA_DIR = path.join(process.cwd(), ".data");
const keyFor = (id: string) => `cv/${id}.json`;

const ID_ALPHABET = "abcdefghijkmnopqrstuvwxyz23456789";

function randomId(len: number) {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(bytes, (b) => ID_ALPHABET[b % ID_ALPHABET.length]).join("");
}

export const newCvId = () => randomId(10);
export const newEditKey = () => randomId(24);

/** Reject ids that could escape the `cv/` prefix or a local path. */
export function isValidId(id: string) {
  return /^[a-z0-9]{4,40}$/.test(id);
}

// ---------------------------------------------------------------- blob driver

async function blobRead(id: string): Promise<CvRecord | null> {
  try {
    const meta = await head(keyFor(id));
    const res = await fetch(meta.url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as CvRecord;
  } catch {
    return null;
  }
}

async function blobWrite(record: CvRecord) {
  await put(keyFor(record.id), JSON.stringify(record, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0,
  });
}

async function blobList(): Promise<CvRecord[]> {
  const { blobs } = await list({ prefix: "cv/", limit: 100 });
  const records = await Promise.all(
    blobs.map(async (b) => {
      try {
        const res = await fetch(b.url, { cache: "no-store" });
        return res.ok ? ((await res.json()) as CvRecord) : null;
      } catch {
        return null;
      }
    }),
  );
  return records.filter((r): r is CvRecord => r !== null);
}

// ------------------------------------------------------------- local fallback

const localPath = (id: string) => path.join(DATA_DIR, `${id}.json`);

async function localRead(id: string): Promise<CvRecord | null> {
  try {
    return JSON.parse(await fs.readFile(localPath(id), "utf8")) as CvRecord;
  } catch {
    return null;
  }
}

async function localWrite(record: CvRecord) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(localPath(record.id), JSON.stringify(record, null, 2), "utf8");
}

async function localList(): Promise<CvRecord[]> {
  try {
    const files = await fs.readdir(DATA_DIR);
    const records = await Promise.all(
      files.filter((f) => f.endsWith(".json")).map((f) => localRead(f.replace(/\.json$/, ""))),
    );
    return records.filter((r): r is CvRecord => r !== null);
  } catch {
    return [];
  }
}

// ------------------------------------------------------------------ public API

export async function getCv(id: string): Promise<CvRecord | null> {
  if (!isValidId(id)) return null;
  return hasBlob() ? blobRead(id) : localRead(id);
}

export async function saveCv(record: CvRecord): Promise<CvRecord> {
  const next = { ...record, updatedAt: new Date().toISOString() };
  if (hasBlob()) await blobWrite(next);
  else await localWrite(next);
  return next;
}

export async function createCv(data: CvData): Promise<CvRecord> {
  const now = new Date().toISOString();
  return saveCv({
    id: newCvId(),
    editKey: newEditKey(),
    data,
    createdAt: now,
    updatedAt: now,
  });
}

export async function listCvs(): Promise<CvRecord[]> {
  const records = hasBlob() ? await blobList() : await localList();
  return records.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/** What a viewer is allowed to see: never the edit key. */
export function publicView(record: CvRecord) {
  return {
    id: record.id,
    data: record.data,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}
