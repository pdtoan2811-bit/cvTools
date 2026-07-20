import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CvDocument from "@/components/CvDocument";
import PrintButton from "@/components/PrintButton";
import { getCv } from "@/lib/store";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const record = await getCv(id);
  if (!record) return { title: "CV not found" };
  const { name, title } = record.data;
  const description = title ? `${name} — ${title}` : name;
  return {
    title: `CV — ${name}`,
    description,
    // A CV carries a phone number and an email. The link is meant to be shared
    // deliberately, not discovered in a search result, and the id is the only
    // thing protecting it — so keep it out of indexes.
    robots: { index: false, follow: false, nocache: true },
    openGraph: { title: `CV — ${name}`, description, type: "profile" },
  };
}

/** Public, read-only CV. This is the link you share. */
export default async function CvPage({ params }: Props) {
  const { id } = await params;
  const record = await getCv(id);
  if (!record) notFound();

  return (
    <>
      <div className="toolbar">
        <span className="brand">
          CV — <code>{record.data.name}</code>
        </span>
        <div className="actions">
          <PrintButton />
        </div>
      </div>
      <p className="hint">
        Click <b>Export PDF</b> → choose <b>Save as PDF</b>, margins <b>None</b>, and enable{" "}
        <b>Background graphics</b> to keep the paper tint &amp; colors.
      </p>

      <div className="page-wrap">
        <div className="sheet">
          <CvDocument data={record.data} />
        </div>
      </div>
    </>
  );
}
