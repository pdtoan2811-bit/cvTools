"use client";

export default function PrintButton({ label = "⬇ Export PDF" }: { label?: string }) {
  return (
    <button className="btn primary" onClick={() => window.print()}>
      {label}
    </button>
  );
}
