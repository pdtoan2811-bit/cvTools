import Link from "next/link";
import { listCvs } from "@/lib/store";
import NewCvButtons from "@/components/NewCvButtons";

export const dynamic = "force-dynamic";

/**
 * Edit links contain the secret edit key, so the index only reveals them to
 * the owner: either local development (data lives in `.data/`, not shared) or
 * `/?admin=<ADMIN_TOKEN>` in production.
 */
function canSeeEditLinks(admin: string | undefined) {
  const token = process.env.ADMIN_TOKEN;
  if (!process.env.BLOB_READ_WRITE_TOKEN) return true; // local dev
  return Boolean(token) && admin === token;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ admin?: string }>;
}) {
  const { admin } = await searchParams;
  const cvs = await listCvs();
  const showEdit = canSeeEditLinks(admin);

  return (
    <>
      <div className="toolbar">
        <span className="brand">
          CV Tools — <code>editorial edition</code>
        </span>
      </div>

      <div className="shell">
        <h2>Make a CV, share the link, let them edit it.</h2>
        <p className="sub">
          Every CV gets a public read-only link for sharing and a private editor link for
          changes. Export to PDF from the browser at any time.
        </p>

        <div className="card">
          <h3>Start a new CV</h3>
          <p>
            Start from Minh&apos;s CV as transcribed from his PDF, or from a blank document in
            the same editorial design.
          </p>
          <NewCvButtons />
        </div>

        <div className="card">
          <h3>Existing CVs</h3>
          {cvs.length === 0 ? (
            <p className="muted">Nothing stored yet. Create one above — it will show up here.</p>
          ) : (
            <div className="stack">
              {cvs.map((cv) => (
                <div className="row" key={cv.id}>
                  <div className="grow">
                    <b>{cv.data.name}</b>
                    {cv.data.title ? <span className="muted"> — {cv.data.title}</span> : null}
                    <div className="muted">Updated {new Date(cv.updatedAt).toLocaleString()}</div>
                  </div>
                  <Link className="btn sm" href={`/cv/${cv.id}`}>
                    View
                  </Link>
                  {showEdit && (
                    <Link className="btn sm primary" href={`/edit/${cv.id}?k=${cv.editKey}`}>
                      Edit
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
          {!showEdit && (
            <p className="muted" style={{ marginTop: 14 }}>
              Editor links are hidden here because they contain the secret edit key. Set an{" "}
              <code>ADMIN_TOKEN</code> env var and open <code>/?admin=…</code> to see them, or
              keep the link you were given when the CV was created.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
