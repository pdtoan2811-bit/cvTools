"use client";

/** Small shared field primitives for the editor. */

export function Text({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <input
        className="tx"
        type="text"
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function Area({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <textarea
        className="tx"
        rows={rows}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/**
 * A list of short strings edited as one textarea, one item per line. Much
 * faster to work with than a row of inputs for bullet points and skills.
 */
export function Lines({
  label,
  value,
  onChange,
  rows = 5,
  hint,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  rows?: number;
  hint?: string;
}) {
  return (
    <div className="field">
      <label>
        {label}
        {hint ? <span style={{ textTransform: "none", letterSpacing: 0 }}> — {hint}</span> : null}
      </label>
      <textarea
        className="tx"
        rows={rows}
        value={value.join("\n")}
        // Blank lines are kept while typing and stripped by `cleanCv` on save,
        // so pressing Enter doesn't fight the cursor.
        onChange={(e) => onChange(e.target.value.split("\n"))}
      />
    </div>
  );
}

/** Header row for one item in a repeatable list, with reorder + delete. */
export function ItemHead({
  index,
  title,
  onUp,
  onDown,
  onRemove,
}: {
  index: number;
  title: string;
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="item-head">
      <span>
        <span className="idx">{String(index + 1).padStart(2, "0")}</span>
        {title || "Untitled"}
      </span>
      <span className="row">
        <button type="button" className="btn sm" onClick={onUp} title="Move up">
          ↑
        </button>
        <button type="button" className="btn sm" onClick={onDown} title="Move down">
          ↓
        </button>
        <button type="button" className="btn sm ghost" onClick={onRemove} title="Remove">
          ✕
        </button>
      </span>
    </div>
  );
}

export function Panel({
  title,
  count,
  children,
  open,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
  open?: boolean;
}) {
  return (
    <details className="panel" open={open}>
      <summary>
        {title}
        {count !== undefined && <span className="count">{count}</span>}
      </summary>
      <div className="panel-body">{children}</div>
    </details>
  );
}

/**
 * Immutable list helpers used by every repeatable section.
 *
 * `apply` takes an updater rather than a finished array, so two edits fired
 * from the same handler each see the previous one's result instead of both
 * starting from the array captured at render time.
 */
export const listOps = <T,>(apply: (updater: (prev: T[]) => T[]) => void) => ({
  add: (item: T) => apply((prev) => [...prev, item]),
  remove: (i: number) => apply((prev) => prev.filter((_, j) => j !== i)),
  update: (i: number, patch: Partial<T>) =>
    apply((prev) => prev.map((it, j) => (j === i ? { ...it, ...patch } : it))),
  /** Update item `i` from its own previous value — needed for nested lists. */
  updateWith: (i: number, fn: (item: T) => T) =>
    apply((prev) => prev.map((it, j) => (j === i ? fn(it) : it))),
  move: (i: number, dir: -1 | 1) =>
    apply((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    }),
});
