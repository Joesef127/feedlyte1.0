/* eslint-disable @next/next/no-sync-scripts */
import { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";
import "./marketing.css";
import "../globals.css";

// Instrument Serif only used on marketing pages — loaded here, not in root layout
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Feedlyte - Feedback infrastructure for modern products",
  description:
    "Drop one script tag into any website and instantly collect user feedback. No SDK, no npm package, no complex setup.",
  openGraph: {
    title: "Feedlyte - Feedback infrastructure for modern products",
    description:
      "Drop one script tag into any website and instantly collect user feedback.",
    type: "website",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No <html> or <body> — root layout owns those.
  // We just inject the font variable and marketing styles.
  const projectId = process.env.NEXT_PUBLIC_FEEDLYTE_PROJECT;

  return (
    <html lang="en">
    {projectId && (
      <script
        src="https://feedlyte.vercel.app/widget.js"
        data-project={projectId}
      ></script>
    )}
    <body className={`${instrumentSerif.variable} grain`}>
      {children}
    </body>
    </html>
  );
}