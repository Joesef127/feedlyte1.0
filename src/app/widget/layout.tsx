import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FeedStack Widget",
};

export default function WidgetLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "transparent" }}>
        {children}
      </body>
    </html>
  );
}
