/**
 * Immutable get/set/splice by path, so the CV document can edit itself.
 *
 * A path is a list of keys and array indices — `["experience", 2, "points", 0]`
 * addresses the first bullet of the third job. Inline fields in the rendered CV
 * carry their own path, which keeps the editor from needing a bespoke callback
 * per field.
 */

export type Path = (string | number)[];

const clone = (node: unknown): any =>
  Array.isArray(node) ? [...node] : { ...(node as object) };

export function getIn<T = unknown>(obj: unknown, path: Path): T | undefined {
  let cur: any = obj;
  for (const key of path) {
    if (cur == null) return undefined;
    cur = cur[key];
  }
  return cur as T;
}

/** Returns a copy of `obj` with `path` set to `value`. */
export function setIn<T>(obj: T, path: Path, value: unknown): T {
  if (path.length === 0) return value as T;
  const [head, ...rest] = path;
  const next = clone(obj ?? (typeof head === "number" ? [] : {}));
  next[head] = rest.length ? setIn(next[head], rest, value) : value;
  return next;
}

/** Returns a copy of `obj` with the array at `path` spliced. */
export function spliceIn<T>(obj: T, path: Path, index: number, remove: number, ...insert: unknown[]): T {
  const list = (getIn<unknown[]>(obj, path) || []).slice();
  list.splice(index, remove, ...insert);
  return setIn(obj, path, list);
}
