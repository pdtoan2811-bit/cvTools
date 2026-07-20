"use client";

/** Last resort: the root layout itself failed, so this ships its own <html>. */
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          background: "#e9e6dd",
          color: "#1a1814",
          padding: "60px 22px",
          textAlign: "center",
        }}
      >
        <h2>Something went wrong</h2>
        <p style={{ color: "#8f8a7e" }}>The application failed to start.</p>
        <button onClick={reset} style={{ padding: "8px 16px", cursor: "pointer" }}>
          Try again
        </button>
      </body>
    </html>
  );
}
