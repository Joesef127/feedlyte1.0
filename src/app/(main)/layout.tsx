import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "../globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Feedlyte — Feedback infrastructure for modern products",
  description: "Collect and manage feedback from your users with a lightweight embeddable widget.",
};

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Anti-FOUC: apply saved theme before first paint */}
      <body
        className={`${dmSans.variable} ${dmMono.variable} antialiased font-sans`}
      >
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){var t=localStorage.getItem('feedlyte-theme')||'dark';document.documentElement.setAttribute('data-theme',t);})()`,
        }}
      />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
