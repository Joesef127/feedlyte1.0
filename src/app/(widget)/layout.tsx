import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "../globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Feedlyte Widget",
};

/**
 * Isolated root layout for the /widget route.
 * Imports globals.css so Tailwind CSS utility classes and design tokens are loaded.
 * The <style> tag keeps html and body background transparent for the iframe overlay.
 */
export default function WidgetRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ colorScheme: "normal" }}>
      <body className={`${dmSans.variable} font-sans`}>
        <style>{`
          html, body {
            background: transparent !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            color-scheme: normal !important;
          }
          *, *::before, *::after {
            box-sizing: border-box;
          }
        `}</style>
        {children}
      </body>
    </html>
  );
}
