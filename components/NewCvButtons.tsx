"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { fetchJson } from "@/lib/fetch-json";

/** Creates a CV, then sends you straight into its editor. */
export default function NewCvButtons({ admin }: { admin?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function create(seed: "minh" | "blank") {
    setBusy(seed);
    setError("");
    try {
      const json = await fetchJson<{ id: string; editKey: string }>(
        admin ? `/api/cv?admin=${encodeURIComponent(admin)}` : "/api/cv",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ seed }),
        },
      );
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
