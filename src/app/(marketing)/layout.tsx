import { Metadata } from "next";
import {
  Instrument_Serif,
  DM_Sans,
  DM_Mono,
  Fraunces,
  Lora,
} from "next/font/google";
import "./marketing.css";
import "../globals.css";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
});

const dmMono = DM_Mono({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-dm-mono",
});

export const metadata: Metadata = {
  title: "Feedlyte — Feedback infrastructure for modern products",
  description:
    "Drop one script tag into any website and instantly collect user feedback. Sandboxed iframe, multi-category triage, and real-time dashboard.",
  openGraph: {
    title: "Feedlyte — Feedback infrastructure for modern products",
    description:
      "Drop one script tag into any website and instantly collect user feedback. Sandboxed iframe, multi-category triage, and real-time dashboard.",
    type: "website",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const projectId = process.env.NEXT_PUBLIC_FEEDLYTE_PROJECT;

  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        {projectId && (
          <script
            src="https://feedlyte.vercel.app/widget.js"
            data-project={projectId}
            defer
          ></script>
        )}
      </head>
      <body
        className={`${fraunces.variable} ${dmSans.variable} ${dmMono.variable} ${lora.variable} font-sans antialiased text-foreground bg-background grain selection:bg-primary/20 selection:text-primary min-h-screen`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('feedlyte-theme')||'dark';document.documentElement.setAttribute('data-theme',t);})()`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
