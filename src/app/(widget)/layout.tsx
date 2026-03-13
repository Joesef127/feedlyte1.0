import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FeedStack Widget",
};

/**
 * Isolated root layout for the /widget route.
 * No app CSS is imported here — the widget is a self-contained overlay
 * rendered inside an iframe on third-party pages.
 * The <style> tag is placed first in <body> so it applies before any
 * child renders, overriding the browser's default white document background.
 */
export default function WidgetRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ colorScheme: "normal" }}>
      <body>
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
