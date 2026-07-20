"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CvDocument from "@/components/CvDocument";
import { EditContext, focusKey, type EditApi } from "@/components/Editable";
import ImagePicker from "./ImagePicker";
import { Area, ItemHead, Lines, Panel, Text, listOps } from "./fields";
import { cleanCv } from "@/lib/clean";
import { setIn, spliceIn, type Path } from "@/lib/path";
import { fetchJson } from "@/lib/fetch-json";
import type {
  AchievementGroup,
  Client,
  CvData,
  Education,
  Experience,
  Language,
  Link,
  Product,
  Project,
} from "@/lib/types";

type Props = { id: string; editKey: string; initial: CvData; isNew: boolean };

const AUTOSAVE_MS = 1500;

export default function CvEditor({ id, editKey, initial, isNew }: Props) {
  const [data, setData] = useState<CvData>(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [pendingFocus, setPendingFocus] = useState<string | null>(null);
  const dirty = useRef(false);

  const set = useCallback(<K extends keyof CvData>(key: K, value: CvData[K]) => {
    dirty.current = true;
    setData((d) => ({ ...d, [key]: value }));
  }, []);

  /** Functional updater for one of the CV's list fields. */
  const setList = useCallback(
    <K extends "experience" | "education" | "clients" | "languages" | "projects" | "links">(
      key: K,
    ) =>
      (updater: (prev: NonNullable<CvData[K]>) => NonNullable<CvData[K]>) => {
        dirty.current = true;
        setData((d) => ({ ...d, [key]: updater((d[key] || []) as NonNullable<CvData[K]>) }));
      },
    [],
  );

  /**
   * The API the rendered CV uses to edit itself in place. Paths address the
   * document directly, so a field commits without the editor knowing it exists.
   */
  const editApi = useMemo<EditApi>(
    () => ({
      set: (path: Path, value: string) => {
        dirty.current = true;
        setData((d) => setIn(d, path, value));
      },
      insert: (path: Path, index: number, item: unknown) => {
        dirty.current = true;
        setData((d) => spliceIn(d, path, index, 0, item));
        setPendingFocus(focusKey([...path, index]));
      },
      remove: (path: Path, index: number) => {
        dirty.current = true;
        setData((d) => spliceIn(d, path, index, 1));
        // Fall back to the entry above, the way a list behaves everywhere else.
        if (index > 0) setPendingFocus(focusKey([...path, index - 1]));
      },
      pendingFocus,
      focusClaimed: () => setPendingFocus(null),
    }),
    [pendingFocus],
  );

  const save = useCallback(async () => {
    setStatus("saving");
    setError("");
    try {
      await fetchJson(`/api/cv/${id}`, {
        method: "PUT",
        headers: { "content-type": "application/json", "x-edit-key": editKey },
        body: JSON.stringify({ data: cleanCv(data) }),
      });
      dirty.current = false;
      setStatus("saved");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  }, [data, editKey, id]);

  // Autosave a short moment after you stop typing.
  useEffect(() => {
    if (!dirty.current) return;
    const t = setTimeout(() => void save(), AUTOSAVE_MS);
    return () => clearTimeout(t);
  }, [data, save]);

  // Don't let a half-typed edit disappear on navigation.
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  const shareUrl = typeof window === "undefined" ? "" : `${window.location.origin}/cv/${id}`;
  const editUrl =
    typeof window === "undefined" ? "" : `${window.location.origin}/edit/${id}?k=${editKey}`;

  async function copy(text: string, which: string) {
    await navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(""), 1600);
  }

  const contact = data.contact || {};
  const setContact = (patch: Partial<CvData["contact"]>) =>
    set("contact", { ...contact, ...patch });

  const exp = listOps<Experience>(setList("experience"));
  const edu = listOps<Education>(setList("education"));
  const cli = listOps<Client>(setList("clients"));
  const lang = listOps<Language>(setList("languages"));
  const proj = listOps<Project>(setList("projects"));
  const link = listOps<Link>(setList("links"));

  return (
    <>
      <div className="ed-bar">
        <span className="title">
          Editing <b>{data.name || "Untitled"}</b>
          {status === "saving" && <span className="muted"> · saving…</span>}
          {status === "saved" && <span className="ok"> · saved</span>}
          {status === "error" && <span className="err"> · {error}</span>}
        </span>
        <div className="actions">
          <a className="btn" href={`/cv/${id}`} target="_blank" rel="noopener">
            View
          </a>
          <button className="btn" onClick={() => window.print()}>
            ⬇ PDF
          </button>
          <button className="btn primary" onClick={() => void save()} disabled={status === "saving"}>
            Save
          </button>
        </div>
      </div>

      <div className="editor-shell">
        <div className="editor-pane">
          {isNew && (
            <div className="card" style={{ padding: 16 }}>
              <h3>Save these two links</h3>
              <p>
                The share link is public and read-only. The editor link is the password — anyone
                with it can change this CV, so send it only to Minh.
              </p>
              <div className="stack">
                <div className="sharebox">
                  <code className="grow">{shareUrl}</code>
                  <button className="btn sm" onClick={() => void copy(shareUrl, "share")}>
                    {copied === "share" ? "Copied" : "Copy share link"}
                  </button>
                </div>
                <div className="sharebox">
                  <code className="grow">{editUrl}</code>
                  <button className="btn sm" onClick={() => void copy(editUrl, "edit")}>
                    {copied === "edit" ? "Copied" : "Copy editor link"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- Header ---------------- */}
          <Panel title="Header & contact" open>
            <div className="field-row">
              <Text label="Full name" value={data.name} onChange={(v) => set("name", v)} />
              <Text
                label="Title"
                value={data.title}
                onChange={(v) => set("title", v)}
                placeholder="Account Manager"
              />
            </div>
            <ImagePicker
              label="Profile photo"
              value={data.photo}
              onChange={(v) => set("photo", v)}
            />
            <div className="field-row">
              <Text
                label="Location"
                value={contact.location}
                onChange={(v) => setContact({ location: v })}
              />
              <Text label="Phone" value={contact.phone} onChange={(v) => setContact({ phone: v })} />
              <Text label="Email" value={contact.email} onChange={(v) => setContact({ email: v })} />
              <Text
                label="Date of birth"
                value={contact.dob}
                onChange={(v) => setContact({ dob: v })}
              />
              <Text
                label="Website"
                value={contact.website}
                onChange={(v) => setContact({ website: v })}
              />
              <Text
                label="LinkedIn URL"
                value={contact.linkedin}
                onChange={(v) => setContact({ linkedin: v })}
              />
            </div>
            <div className="field">
              <label>Accent colour</label>
              <div className="row">
                <input
                  type="color"
                  value={data.accent || "#1f5fbf"}
                  onChange={(e) => set("accent", e.target.value)}
                  style={{ width: 44, height: 30, border: "none", background: "none" }}
                />
                <span className="muted">{data.accent || "#1f5fbf"}</span>
              </div>
            </div>
          </Panel>

          {/* ---------------- Profile ---------------- */}
          <Panel title="Profile" count={data.summary?.length || 0}>
            <Lines
              label="Summary"
              hint="one paragraph per line"
              rows={6}
              value={data.summary || []}
              onChange={(v) => set("summary", v)}
            />
          </Panel>

          {/* ---------------- Experience ---------------- */}
          <Panel title="Experience" count={data.experience?.length || 0}>
            {(data.experience || []).map((e, i) => (
              <div className="item-block" key={i}>
                <ItemHead
                  index={i}
                  title={e.role}
                  onUp={() => exp.move(i, -1)}
                  onDown={() => exp.move(i, 1)}
                  onRemove={() => exp.remove(i)}
                />
                <div className="field-row">
                  <Text label="Role" value={e.role} onChange={(v) => exp.update(i, { role: v })} />
                  <Text
                    label="Company"
                    value={e.company}
                    onChange={(v) => exp.update(i, { company: v })}
                  />
                  <Text
                    label="Period"
                    value={e.period}
                    onChange={(v) => exp.update(i, { period: v })}
                    placeholder="Nov 2024 — Present"
                  />
                </div>
                <Text
                  label="Headline (optional)"
                  value={e.headline}
                  onChange={(v) => exp.update(i, { headline: v })}
                  placeholder="Brought Joy to the world"
                />
                <Lines
                  label="Responsibilities"
                  hint="one bullet per line"
                  value={e.points || []}
                  onChange={(v) => exp.update(i, { points: v })}
                />
                <AchievementsEditor
                  value={e.achievements || []}
                  apply={(u) =>
                    exp.updateWith(i, (job) => ({ ...job, achievements: u(job.achievements || []) }))
                  }
                />
                <ProductsEditor
                  label={e.productsLabel}
                  value={e.products || []}
                  onLabel={(v) => exp.update(i, { productsLabel: v })}
                  apply={(u) =>
                    exp.updateWith(i, (job) => ({ ...job, products: u(job.products || []) }))
                  }
                />
              </div>
            ))}
            <button
              className="btn sm"
              onClick={() => exp.add({ role: "New role", company: "", period: "", points: [] })}
            >
              + Add job
            </button>
          </Panel>

          {/* ---------------- Education ---------------- */}
          <Panel title="Education" count={data.education?.length || 0}>
            {(data.education || []).map((e, i) => (
              <div className="item-block" key={i}>
                <ItemHead
                  index={i}
                  title={e.degree}
                  onUp={() => edu.move(i, -1)}
                  onDown={() => edu.move(i, 1)}
                  onRemove={() => edu.remove(i)}
                />
                <div className="field-row">
                  <Text
                    label="Degree"
                    value={e.degree}
                    onChange={(v) => edu.update(i, { degree: v })}
                  />
                  <Text
                    label="School"
                    value={e.school}
                    onChange={(v) => edu.update(i, { school: v })}
                  />
                  <Text
                    label="Period"
                    value={e.period}
                    onChange={(v) => edu.update(i, { period: v })}
                  />
                </div>
                <Lines
                  label="Certifications"
                  hint="one per line"
                  rows={3}
                  value={e.certifications || []}
                  onChange={(v) => edu.update(i, { certifications: v })}
                />
              </div>
            ))}
            <button
              className="btn sm"
              onClick={() => edu.add({ degree: "New degree", school: "", period: "" })}
            >
              + Add education
            </button>
          </Panel>

          {/* ---------------- Skills / languages / hobbies ---------------- */}
          <Panel title="Skills & tools" count={data.skills?.length || 0}>
            <Lines
              label="Skills"
              hint="one per line; icons are matched automatically"
              rows={8}
              value={data.skills || []}
              onChange={(v) => set("skills", v)}
            />
          </Panel>

          <Panel title="Languages" count={data.languages?.length || 0}>
            {(data.languages || []).map((l, i) => (
              <div className="row" key={i}>
                <div className="grow field-row">
                  <Text
                    label="Language"
                    value={l.name}
                    onChange={(v) => lang.update(i, { name: v })}
                  />
                  <Text
                    label="Level"
                    value={l.level}
                    onChange={(v) => lang.update(i, { level: v })}
                    placeholder="Native / Fluent / Advanced…"
                  />
                </div>
                <button className="btn sm ghost" onClick={() => lang.remove(i)}>
                  ✕
                </button>
              </div>
            ))}
            <button className="btn sm" onClick={() => lang.add({ name: "", level: "Fluent" })}>
              + Add language
            </button>
          </Panel>

          <Panel title="Hobbies">
            <Area
              label="Hobbies"
              rows={2}
              value={data.hobbies}
              onChange={(v) => set("hobbies", v)}
            />
          </Panel>

          {/* ---------------- Clients ---------------- */}
          <Panel title="Clients highlight" count={data.clients?.length || 0}>
            {(data.clients || []).map((c, i) => (
              <div className="item-block" key={i}>
                <ItemHead
                  index={i}
                  title={c.name}
                  onUp={() => cli.move(i, -1)}
                  onDown={() => cli.move(i, 1)}
                  onRemove={() => cli.remove(i)}
                />
                <div className="field-row">
                  <Text label="Name" value={c.name} onChange={(v) => cli.update(i, { name: v })} />
                  <Text label="URL" value={c.url} onChange={(v) => cli.update(i, { url: v })} />
                </div>
                <ImagePicker
                  label="Logo"
                  value={c.logo}
                  auto={{ url: c.url, name: c.name }}
                  onChange={(v) => cli.update(i, { logo: v })}
                />
              </div>
            ))}
            <button className="btn sm" onClick={() => cli.add({ name: "", url: "" })}>
              + Add client
            </button>
          </Panel>

          {/* ---------------- Projects ---------------- */}
          <Panel title="Projects & works" count={data.projects?.length || 0}>
            {(data.projects || []).map((p, i) => (
              <div className="item-block" key={i}>
                <ItemHead
                  index={i}
                  title={p.name}
                  onUp={() => proj.move(i, -1)}
                  onDown={() => proj.move(i, 1)}
                  onRemove={() => proj.remove(i)}
                />
                <div className="field-row">
                  <Text label="Name" value={p.name} onChange={(v) => proj.update(i, { name: v })} />
                  <Text label="URL" value={p.url} onChange={(v) => proj.update(i, { url: v })} />
                </div>
                <Text
                  label="Description"
                  value={p.description}
                  onChange={(v) => proj.update(i, { description: v })}
                />
                <Text
                  label="Group heading (optional)"
                  value={p.group}
                  onChange={(v) => proj.update(i, { group: v })}
                  placeholder="Repeat the same heading to group projects together"
                />
                <ImagePicker
                  label="Thumbnail"
                  value={p.logo}
                  auto={{ url: p.url, name: p.name }}
                  onChange={(v, bg) => proj.update(i, { logo: v, logoBg: bg })}
                />
              </div>
            ))}
            <button className="btn sm" onClick={() => proj.add({ name: "", url: "" })}>
              + Add project
            </button>
          </Panel>

          {/* ---------------- Links ---------------- */}
          <Panel title="Links" count={data.links?.length || 0}>
            {(data.links || []).map((l, i) => (
              <div className="row" key={i}>
                <div className="grow field-row">
                  <Text
                    label="Label"
                    value={l.label}
                    onChange={(v) => link.update(i, { label: v })}
                  />
                  <Text label="URL" value={l.url} onChange={(v) => link.update(i, { url: v })} />
                </div>
                <button className="btn sm ghost" onClick={() => link.remove(i)}>
                  ✕
                </button>
              </div>
            ))}
            <button className="btn sm" onClick={() => link.add({ label: "", url: "" })}>
              + Add link
            </button>
          </Panel>

          {/* ---------------- Backup ---------------- */}
          <Panel title="Import / export JSON">
            <p className="muted">
              Download a backup of this CV, or paste one back in to restore it.
            </p>
            <div className="row">
              <button
                className="btn sm"
                onClick={() => {
                  const blob = new Blob([JSON.stringify(cleanCv(data), null, 2)], {
                    type: "application/json",
                  });
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = `${data.name.replace(/\s+/g, "-").toLowerCase() || "cv"}.json`;
                  a.click();
                  URL.revokeObjectURL(a.href);
                }}
              >
                Download JSON
              </button>
              <label className="btn sm" style={{ display: "inline-block" }}>
                Import JSON
                <input
                  type="file"
                  accept="application/json"
                  hidden
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    try {
                      const parsed = JSON.parse(await f.text()) as CvData;
                      if (!parsed?.name) throw new Error("not a CV file");
                      dirty.current = true;
                      setData(parsed);
                    } catch (err) {
                      setError(`Could not import: ${err instanceof Error ? err.message : err}`);
                      setStatus("error");
                    }
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </Panel>
        </div>

        {/* ------------- Live preview, editable in place ------------- */}
        <div className="preview-pane">
          <p className="pane-hint">
            Click any text below to edit it. <b>Enter</b> adds another bullet,
            <b> Backspace</b> on an empty one removes it, <b>Esc</b> cancels.
          </p>
          <div className="sheet">
            {/* Not `cleanCv` here — stripping blanks mid-edit would delete the
                empty bullet you just made room for. */}
            <EditContext.Provider value={editApi}>
              <CvDocument data={data} />
            </EditContext.Provider>
          </div>
        </div>
      </div>
    </>
  );
}

/** Grouped achievements under a role, e.g. "Team" / "Personal". */
function AchievementsEditor({
  value,
  apply,
}: {
  value: AchievementGroup[];
  apply: (updater: (prev: AchievementGroup[]) => AchievementGroup[]) => void;
}) {
  const ops = listOps<AchievementGroup>(apply);
  return (
    <div className="field">
      <label>Achievements</label>
      <div className="stack">
        {value.map((g, i) => (
          <div className="item-block" key={i}>
            <div className="row">
              <div className="grow">
                <Text
                  label="Group label (optional)"
                  value={g.label}
                  onChange={(v) => ops.update(i, { label: v })}
                  placeholder="Team / Personal"
                />
              </div>
              <button className="btn sm ghost" onClick={() => ops.remove(i)}>
                ✕
              </button>
            </div>
            <Lines
              label="Points"
              hint="one per line"
              value={g.points}
              onChange={(v) => ops.update(i, { points: v })}
            />
          </div>
        ))}
        <button className="btn sm" onClick={() => ops.add({ label: "", points: [] })}>
          + Add achievement group
        </button>
      </div>
    </div>
  );
}

/** Product cards shown inside an experience entry. */
function ProductsEditor({
  label,
  value,
  onLabel,
  apply,
}: {
  label?: string;
  value: Product[];
  onLabel: (v: string) => void;
  apply: (updater: (prev: Product[]) => Product[]) => void;
}) {
  const ops = listOps<Product>(apply);
  return (
    <div className="field">
      <label>Products</label>
      <div className="stack">
        {value.length > 0 && (
          <Text
            label="Showcase heading"
            value={label}
            onChange={onLabel}
            placeholder="Products I helped ideate & ship"
          />
        )}
        {value.map((p, i) => (
          <div className="item-block" key={i}>
            <div className="row">
              <div className="grow field-row">
                <Text label="Name" value={p.name} onChange={(v) => ops.update(i, { name: v })} />
                <Text label="URL" value={p.url} onChange={(v) => ops.update(i, { url: v })} />
              </div>
              <button className="btn sm ghost" onClick={() => ops.remove(i)}>
                ✕
              </button>
            </div>
            <Text
              label="Tagline"
              value={p.tagline}
              onChange={(v) => ops.update(i, { tagline: v })}
            />
            <ImagePicker
              label="Logo"
              value={p.logo}
              auto={{ url: p.url, name: p.name }}
              onChange={(v, bg) => ops.update(i, { logo: v, logoBg: bg })}
            />
          </div>
        ))}
        <button className="btn sm" onClick={() => ops.add({ name: "", url: "" })}>
          + Add product
        </button>
      </div>
    </div>
  );
}
