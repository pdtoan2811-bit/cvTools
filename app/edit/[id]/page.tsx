import Link from "next/link";
import { notFound } from "next/navigation";
import CvEditor from "@/components/editor/CvEditor";
import { getCv } from "@/lib/store";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ k?: string; new?: string }>;
};

/** The editor. Gated on the secret key that lives in the URL. */
export default async function EditPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { k, new: isNew } = await searchParams;

  const record = await getCv(id);
  if (!record) notFound();

  if (k !== record.editKey) {
    return (
      <div className="shell">
        <h2>You need the editor link</h2>
        <p className="sub">
          This CV can only be edited with its private link, which includes an edit key. Ask
          whoever created it to send you the link again.
        </p>
        <Link className="btn" href={`/cv/${id}`}>
          View the CV instead
        </Link>
      </div>
    );
  }

  return (
    <CvEditor id={id} editKey={record.editKey} initial={record.data} isNew={isNew === "1"} />
  );
}
