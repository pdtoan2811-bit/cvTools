import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CV Tools",
  description: "Editorial CV builder — edit, upload, share, export to PDF.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
