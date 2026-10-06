import { Metadata } from "next";
import {
  Instrument_Serif,
  DM_Sans,
  DM_Mono,
  Fraunces,
  Lora,
} from "next/font/google";
import { siteConfig } from "@/lib/site-config";
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
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Feedlyte - Feedback infrastructure for modern products",
    template: "%s | Feedlyte",
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [{ name: "Feedlyte Inc.", url: siteConfig.productionUrl }],
  creator: "Feedlyte",
  publisher: "Feedlyte",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Feedlyte - Feedback infrastructure for modern products",
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Feedlyte - Feedback infrastructure for modern products",
    description: siteConfig.description,
    creator: siteConfig.twitterHandle,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
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
            src="/widget.js"
            data-project={projectId}
            defer
          ></script>
        )}
      </head>
      <body
        className={`${instrumentSerif.variable} ${fraunces.variable} ${dmSans.variable} ${dmMono.variable} ${lora.variable} font-sans antialiased text-foreground bg-background grain selection:bg-primary/20 selection:text-primary min-h-screen`}
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
