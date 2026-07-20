import type { Metadata } from "next";

// The editor URL contains the edit key; it must never reach an index.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function EditLayout({ children }: { children: React.ReactNode }) {
  return children;
}
