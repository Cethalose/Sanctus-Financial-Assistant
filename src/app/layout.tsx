import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sanctus Financial Assistant",
  description: "Manual budget onboarding for Sanctus Financial Assistant Tier 0.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
