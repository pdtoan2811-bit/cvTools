"use client";

import { useState } from "react";
import { cleanCv } from "@/lib/clean";
import { encodeCv, LINK_COMFORTABLE_MAX } from "@/lib/share";
import { clearLocal } from "@/lib/local-store";
import type { CvData } from "@/lib/types";

/**
 * Sharing is a link, not a record.
 *
 * The CV is compressed into the URL fragment, so there is nothing to publish,
 * no account, and no key to keep track of. Whoever opens it sees the CV and can
 * take a copy to edit — which is exactly the hand-off this app is for.
 */
export default function ShareBar({ data }: { data: CvData }) {
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  async function build() {
    setBusy(true);
    try {
      const payload = await encodeCv(cleanCv(data));
      const url = `${window.location.origin}/cv#cv=${payload}`;
      setLink(url);
      setOpen(true);
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        // Clipboard blocked — the field below is selectable.
      }
    } finally {
      setBusy(false);
    }
  }

  function download() {
    const blob = new Blob([JSON.stringify(cleanCv(data), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${(data.name || "cv").replace(/\s+/g, "-").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const tooLong = link.length > LINK_COMFORTABLE_MAX;

  return (
    <>
      <button className="btn primary" onClick={build} disabled={busy}>
        {busy ? "Preparing…" : "Share"}
      </button>

      {open && (
        <div className="share-pop" role="dialog" aria-label="Share this CV">
          <div className="share-head">
            <b>Anyone with this link can read the CV and take a copy to edit.</b>
            <button className="x" onClick={() => setOpen(false)} aria-label="Close">
              ✕
            </button>
          </div>

          <textarea className="tx share-link" readOnly rows={3} value={link} onFocus={(e) => e.currentTarget.select()} />

          <div className="row">
            <button
              className="btn sm primary"
              onClick={async () => {
                await navigator.clipboard.writeText(link);
                setCopied(true);
                setTimeout(() => setCopied(false), 2500);
              }}
            >
              {copied ? "Copied" : "Copy link"}
            </button>
            <button className="btn sm" onClick={download}>
              Download JSON
            </button>
            <span className="muted">{(link.length / 1024).toFixed(1)} KB link</span>
          </div>

          <p className="muted" style={{ marginTop: 10 }}>
            The CV travels inside the link itself — nothing is uploaded, and it keeps working even
            if this site goes away.
            {tooLong && (
              <>
                {" "}
                <b>This link is long</b> because of the images in the CV. Some chat apps break long
                links across lines; send it as a file or a plain-text message, or use{" "}
                <b>Download JSON</b>.
              </>
            )}
          </p>

          <button
            className="btn sm ghost"
            style={{ marginTop: 12 }}
            onClick={() => {
              if (!confirm("Discard your edits and go back to the CV this app ships with?")) return;
              clearLocal();
              window.location.href = "/";
            }}
          >
            Reset to the original CV
          </button>
        </div>
      )}
    </>
  );
}
