import { NextResponse } from "next/server";

/**
 * Wrap a route handler so it always answers with JSON.
 *
 * An uncaught throw returns an empty body, and the client's `res.json()` then
 * fails with "Unexpected end of JSON input" — which says nothing about what
 * actually went wrong. Every failure should arrive as a readable message.
 */
export function jsonRoute<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>,
) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (e) {
      console.error("[api]", e);
      const message = e instanceof Error ? e.message : String(e);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  };
}
