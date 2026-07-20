import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { jsonRoute } from "@/lib/api";
import { FORBIDDEN, hasEditSession } from "@/lib/auth";
import { promises as fs } from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"];

const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

/**
 * POST /api/upload — multipart image upload for photos and logos.
 * Returns `{ url }`, which the editor drops straight into the CV field.
 *
 * With no BLOB_READ_WRITE_TOKEN it writes to `public/uploads/` instead, so
 * local development works with no cloud setup.
 */
export const POST = jsonRoute(async (req: Request) => {
  // Uploads write to the Blob store, so they need the CV's edit key.
  if (!(await hasEditSession(req))) {
    return NextResponse.json(FORBIDDEN, { status: 403 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { error: `Unsupported type ${file.type}. Use PNG, JPEG, WebP, GIF, or SVG.` },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File is larger than 5 MB" }, { status: 413 });
  }

  const ext = EXT[file.type];
  const stamp = crypto.randomUUID().slice(0, 12);
  const safe = (file.name || "image")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .slice(0, 40)
    .toLowerCase();
  const key = `uploads/${safe || "image"}-${stamp}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(key, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
    });
    return NextResponse.json({ url: blob.url });
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, path.basename(key)), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ url: `/${key}` });
});
