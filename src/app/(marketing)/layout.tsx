import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import "./marketing.css";
import { Nav } from "@/components/marketing/nav";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Feedlyte — Feedback infrastructure for modern products",
  description:
    "Drop one script tag into any website and instantly collect user feedback. No SDK, no npm package, no complex setup.",
  openGraph: {
    title: "Feedlyte — Feedback infrastructure for modern products",
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
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${instrumentSerif.variable}`}>
        <Nav />
        {children}
      </body>
    </html>
  );
}