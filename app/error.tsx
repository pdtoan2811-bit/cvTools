"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="shell">
      <h2>That didn&apos;t load</h2>
      <p className="sub">
        Something went wrong rendering this page. Trying again usually works; if it keeps
        happening, the deployment may be missing its Blob store.
      </p>
      <div className="row">
        <button className="btn primary" onClick={reset}>
          Try again
        </button>
        <a className="btn" href="/">
          Start over
        </a>
      </div>
      {error.digest && <p className="muted" style={{ marginTop: 14 }}>Reference: {error.digest}</p>}
    </div>
  );
}
