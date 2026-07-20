"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Creates a CV, then sends you straight into its editor. */
export default function NewCvButtons() {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function create(seed: "minh" | "blank") {
    setBusy(seed);
    setError("");
    try {
      const res = await fetch("/api/cv", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ seed }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not create the CV");
      router.push(`/edit/${json.id}?k=${json.editKey}&new=1`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setBusy(null);
    }
  }

  return (
    <>
      <div className="row">
        <button className="btn primary" disabled={busy !== null} onClick={() => create("minh")}>
          {busy === "minh" ? "Creating…" : "Start from Minh's CV"}
        </button>
        <button className="btn" disabled={busy !== null} onClick={() => create("blank")}>
          {busy === "blank" ? "Creating…" : "Blank CV"}
        </button>
      </div>
      {error && <div className="err">{error}</div>}
    </>
  );
}
