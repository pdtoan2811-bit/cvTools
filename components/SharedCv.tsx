"use client";

import { useEffect, useState } from "react";
import CvDocument from "./CvDocument";
import { decodeCv, encodeCv, payloadFromHash } from "@/lib/share";
import { saveLocal } from "@/lib/local-store";
import type { CvData } from "@/lib/types";

type State = { status: "loading" } | { status: "ready"; data: CvData } | { status: "empty" };

export default function SharedCv() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    const payload = payloadFromHash();
    if (!payload) {
      setState({ status: "empty" });
      return;
    }
    decodeCv(payload).then((data) =>
      setState(data ? { status: "ready", data } : { status: "empty" }),
    );
  }, []);

  /** Take the shared CV as your own working copy and start editing it. */
  async function editCopy() {
    if (state.status !== "ready") return;
    setOpening(true);
    const saved = saveLocal(state.data);
    if (saved.ok) {
      // Tells the editor to explain that this copy is now theirs.
      try {
        sessionStorage.setItem("cvtools:just-forked", "1");
      } catch {
        /* private mode — the note is optional */
      }
      window.location.href = "/";
      return;
    }
    // Storage refused it (usually large images) — hand the document over in the
    // URL instead so the edit still happens.
    window.location.href = `/#cv=${await encodeCv(state.data)}`;
  }

  if (state.status === "loading") {
    return (
      <div className="boot">
        <span className="boot-dot" />
        Opening this CV…
      </div>
    );
  }

  if (state.status === "empty") {
    return (
      <div className="shell">
        <h2>This link has no CV in it</h2>
        <p className="sub">
          A share link carries the whole CV after the <code>#</code>. If it was shortened, wrapped
          across lines in a chat, or copied only partly, that part is lost — ask for it again.
        </p>
        <a className="btn primary" href="/">
          Open the editor
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="toolbar">
        <span className="brand">
          CV — <code>{state.data.name}</code>
        </span>
        <div className="actions">
          <button className="btn" onClick={editCopy} disabled={opening}>
            {opening ? "Opening…" : "✎ Edit a copy"}
          </button>
          <button className="btn primary" onClick={() => window.print()}>
            ⬇ Export PDF
          </button>
        </div>
      </div>
      <p className="hint">
        Click <b>Export PDF</b> → choose <b>Save as PDF</b>, margins <b>None</b>, and enable{" "}
        <b>Background graphics</b> to keep the paper tint &amp; colors.
      </p>

      <div className="page-wrap">
        <div className="sheet">
          <CvDocument data={state.data} />
        </div>
      </div>
    </>
  );
}
