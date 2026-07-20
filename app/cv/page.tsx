import type { Metadata } from "next";
import SharedCv from "@/components/SharedCv";

export const metadata: Metadata = {
  title: "CV",
  // A shared CV carries a phone number and an email.
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Read-only view of a shared CV. The document rides in the URL fragment, which
 * the browser never sends to a server, so this page renders it client-side.
 */
export default function SharedCvPage() {
  return <SharedCv />;
}
