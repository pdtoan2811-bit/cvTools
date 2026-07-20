import { NextResponse } from "next/server";
import { getCv, publicView, saveCv } from "@/lib/store";
import type { CvData } from "@/lib/types";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/cv/:id — public read. Never exposes the edit key. */
export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const record = await getCv(id);
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(publicView(record));
}

/**
 * PUT /api/cv/:id — save an edit. Requires the secret edit key, supplied as
 * `x-edit-key` or `?k=`. This is the only gate on writes, so the editor link is
 * the credential: share the /cv/:id link publicly, the /edit link only with
 * people who should be able to change it.
 */
export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params;
  const record = await getCv(id);
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const url = new URL(req.url);
  const key = req.headers.get("x-edit-key") || url.searchParams.get("k") || "";
  if (key !== record.editKey) {
    return NextResponse.json({ error: "Invalid edit key" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as { data?: CvData } | null;
  if (!body?.data || typeof body.data !== "object" || !("name" in body.data)) {
    return NextResponse.json({ error: "Body must be { data: CvData }" }, { status: 400 });
  }

  const saved = await saveCv({ ...record, data: body.data });
  return NextResponse.json({ ok: true, updatedAt: saved.updatedAt });
}
