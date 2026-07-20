import { NextResponse } from "next/server";
import { jsonRoute } from "@/lib/api";
import { createCv, listCvs } from "@/lib/store";
import { MINH } from "@/lib/seed-minh";
import { emptyCv, type CvData } from "@/lib/types";

export const dynamic = "force-dynamic";

/** GET /api/cv — index of stored CVs (no edit keys). */
export const GET = jsonRoute(async () => {
  const records = await listCvs();
  return NextResponse.json({
    cvs: records.map((r) => ({
      id: r.id,
      name: r.data.name,
      title: r.data.title,
      updatedAt: r.updatedAt,
    })),
  });
});

/**
 * POST /api/cv — create a CV.
 * Body: `{ seed: "minh" | "blank" }` or `{ data: CvData }`.
 * Returns the id plus the edit key, which is shown once and lives in the
 * editor URL from then on.
 */
export const POST = jsonRoute(async (req: Request) => {
  const body = (await req.json().catch(() => ({}))) as {
    seed?: string;
    data?: CvData;
    name?: string;
  };

  const data: CvData =
    body.data ?? (body.seed === "minh" ? MINH : emptyCv(body.name || "Your Name"));

  const record = await createCv(data);
  return NextResponse.json({ id: record.id, editKey: record.editKey }, { status: 201 });
});
