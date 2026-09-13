import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "../globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Track your feedback — Feedlyte",
};

/**
 * Minimal, self-contained root layout for the public /track/[token] page.
 * No dashboard chrome, no auth — anyone with a valid tracking link can view it.
 */
export default function TrackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <body className={`${dmSans.variable} antialiased font-sans`}>
        {children}
      </body>
    </html>
  );
}
