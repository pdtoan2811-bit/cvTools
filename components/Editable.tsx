"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import type { Path } from "@/lib/path";

/**
 * Inline editing for the rendered CV.
 *
 * `CvDocument` wraps every piece of text in `<T>`. With no EditContext above it
 * — the public `/cv/<id>` page — `<T>` renders plain text and the markup is
 * identical to a static CV. Inside the editor, the same element becomes
 * contentEditable and commits its value back by path on blur.
 */

export type EditApi = {
  set: (path: Path, value: string) => void;
  /** Insert `item` at `index` in the list at `path`. */
  insert: (path: Path, index: number, item: unknown) => void;
  /** Remove the entry at `index` from the list at `path`. */
  remove: (path: Path, index: number) => void;
  /**
   * Path of a field that should take the caret once it renders, as a JSON key.
   * Insert/remove set this; the matching field claims it and calls
   * `focusClaimed`. Waiting on a path rather than a timer means the caret never
   * lands on a stale element — after Enter the new bullet does not exist yet.
   */
  pendingFocus: string | null;
  focusClaimed: () => void;
};

export const focusKey = (path: Path) => JSON.stringify(path);

export const EditContext = createContext<EditApi | null>(null);

export const useEdit = () => useContext(EditContext);

/**
 * Which CV is being edited, and with what key. The upload and thumbnail
 * endpoints require this, so the pickers read it from here rather than having
 * it threaded through every call site.
 */
export type CvSession = { id: string; editKey: string };
export const SessionContext = createContext<CvSession | null>(null);
export const useSession = () => useContext(SessionContext);

/** Query string that authorises a write for the current CV. */
export function authQuery(session: CvSession | null): string {
  return session ? `cv=${encodeURIComponent(session.id)}&k=${encodeURIComponent(session.editKey)}` : "";
}

type TProps = {
  /** Where this text lives in the CV document. */
  path: Path;
  value?: string;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  /** Shown greyed when the field is empty and editing is on. */
  placeholder?: string;
  /** Allow Enter to insert a line break instead of committing. */
  multiline?: boolean;
  /** Render nothing when empty and not editing (optional fields). */
  hideWhenEmpty?: boolean;
  /** Enter at the end of this field adds a sibling; Backspace on empty removes it. */
  listPath?: Path;
  listIndex?: number;
};

export function T({
  path,
  value = "",
  as = "span",
  className,
  placeholder,
  multiline,
  hideWhenEmpty,
  listPath,
  listIndex,
}: TProps) {
  const api = useEdit();
  const ref = useRef<HTMLElement>(null);

  // Push external changes in, but never while the user is typing here — that
  // would fight the caret.
  useEffect(() => {
    const el = ref.current;
    if (!el || document.activeElement === el) return;
    if (el.textContent !== value) el.textContent = value;
  }, [value, api]);

  // Claim the caret if this field is the one a list edit just created.
  const pending = api?.pendingFocus;
  useEffect(() => {
    if (!api || !pending || pending !== focusKey(path)) return;
    const el = ref.current;
    if (!el) return;
    el.focus();
    caretToEnd(el);
    api.focusClaimed();
  });

  const Tag = as as "span";

  if (!api) {
    if (!value && hideWhenEmpty) return null;
    return <Tag className={className}>{value}</Tag>;
  }

  return (
    <Tag
      ref={ref as React.Ref<HTMLSpanElement>}
      className={[className, "ed-f", !value && "is-empty"].filter(Boolean).join(" ")}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      data-ph={placeholder}
      onBlur={(e) => {
        const next = e.currentTarget.textContent ?? "";
        if (next !== value) api.set(path, next);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.currentTarget.textContent = value;
          e.currentTarget.blur();
          return;
        }
        if (e.key === "Enter" && !multiline) {
          e.preventDefault();
          const el = e.currentTarget;
          const next = el.textContent ?? "";
          if (listPath && listIndex !== undefined) {
            // Commit this field, then open a fresh sibling below it.
            if (next !== value) api.set(path, next);
            api.insert(listPath, listIndex + 1, "");
          } else {
            el.blur();
          }
        }
        if (
          e.key === "Backspace" &&
          listPath &&
          listIndex !== undefined &&
          (e.currentTarget.textContent ?? "") === ""
        ) {
          e.preventDefault();
          api.remove(listPath, listIndex);
        }
      }}
    />
  );
}

/** Put the caret at the end of a freshly focused field. */
function caretToEnd(el: HTMLElement) {
  const sel = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  sel?.removeAllRanges();
  sel?.addRange(range);
}

/** Hover controls for one entry in a repeatable list, rendered in the CV. */
export function RowTools({
  listPath,
  index,
  blank,
  label,
}: {
  listPath: Path;
  index: number;
  blank: unknown;
  label: string;
}) {
  const api = useEdit();
  if (!api) return null;
  return (
    <span className="row-tools" contentEditable={false}>
      <button
        type="button"
        title={`Add ${label} below`}
        onClick={() => api.insert(listPath, index + 1, blank)}
      >
        +
      </button>
      <button type="button" title={`Remove this ${label}`} onClick={() => api.remove(listPath, index)}>
        ✕
      </button>
    </span>
  );
}
