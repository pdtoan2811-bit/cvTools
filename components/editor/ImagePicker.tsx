"use client";

import { useRef, useState } from "react";
import { fetchJson } from "@/lib/fetch-json";

type Props = {
  label: string;
  value?: string;
  /**
   * Receives the image URL and, for library logos that need one, a background
   * colour. Both arrive together so the consumer applies a single update.
   */
  onChange: (url: string, bg?: string) => void;
  /** When set, an "Auto" button resolves a logo from this entry's URL / name. */
  auto?: { url?: string; name?: string };
};

/**
 * One image field, three ways to fill it:
 *   Upload — send a file to /api/upload (Vercel Blob)
 *   Auto   — resolve a logo from the entry's URL via /api/thumbnail
 *   Paste  — type any image URL directly
 */
export default function ImagePicker({ label, value, onChange, auto }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"upload" | "auto" | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  async function upload(file: File) {
    setBusy("upload");
    setError("");
    setNote("");
    try {
      const body = new FormData();
      body.append("file", file);
      const json = await fetchJson<{ url: string }>("/api/upload", { method: "POST", body });
      onChange(json.url, undefined);
      setNote("Uploaded");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function resolveAuto() {
    if (!auto?.url && !auto?.name) return;
    setBusy("auto");
    setError("");
    setNote("");
    try {
      const qs = new URLSearchParams();
      if (auto.url) qs.set("url", auto.url);
      if (auto.name) qs.set("name", auto.name);
      const json = await fetchJson<{ url: string; bg?: string; source: string }>(
        `/api/thumbnail?${qs}`,
      );
      onChange(json.url, json.bg);
      setNote(
        json.source === "library"
          ? "Matched a logo already in this project"
          : json.source === "page"
            ? "Pulled from the page's social image"
            : "Used the site favicon",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="field">
      <label>{label}</label>
      <div className="imgpick">
        <span className={`thumb${value ? "" : " empty"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {value ? <img src={value} alt="" /> : "none"}
        </span>
        <div className="controls">
          <input
            className="tx"
            type="text"
            placeholder="Image URL, or use the buttons below"
            value={value || ""}
            onChange={(e) => onChange(e.target.value, undefined)}
          />
          <div className="row">
            <button
              type="button"
              className="btn sm"
              disabled={busy !== null}
              onClick={() => fileRef.current?.click()}
            >
              {busy === "upload" ? "Uploading…" : "Upload"}
            </button>
            {auto && (
              <button
                type="button"
                className="btn sm"
                disabled={busy !== null || (!auto.url && !auto.name)}
                onClick={resolveAuto}
                title="Find a logo from this entry's link"
              >
                {busy === "auto" ? "Finding…" : "Auto"}
              </button>
            )}
            {value && (
              <button type="button" className="btn sm ghost" onClick={() => onChange("", undefined)}>
                Clear
              </button>
            )}
          </div>
          {note && <span className="ok">{note}</span>}
          {error && <span className="err">{error}</span>}
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void upload(f);
        }}
      />
    </div>
  );
}
