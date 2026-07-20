/**
 * `fetch` + JSON parsing that never throws "Unexpected end of JSON input".
 *
 * A crashed or timed-out serverless function can answer with an empty body or
 * an HTML error page. Calling `res.json()` on that hides the real problem
 * behind a parser error, so read the body as text first and surface the status.
 */
export async function fetchJson<T = unknown>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(input, init);
  const text = await res.text();

  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      // Not JSON — an HTML error page or a proxy message.
    }
  }

  if (!res.ok) {
    const fromJson =
      body && typeof body === "object" && "error" in body
        ? String((body as { error: unknown }).error)
        : "";
    throw new Error(
      fromJson ||
        (text
          ? `${res.status} ${res.statusText}: ${text.slice(0, 200)}`
          : `The server returned ${res.status} ${res.statusText} with an empty response.`),
    );
  }

  if (body === null) {
    throw new Error(`The server returned an empty response (${res.status}).`);
  }
  return body as T;
}
