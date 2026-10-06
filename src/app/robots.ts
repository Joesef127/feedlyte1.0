import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.url.replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/auth", "/privacy", "/terms"],
        disallow: [
          "/api/",
          "/dashboard/",
          "/widget/",
          "/track/",
          "/widget-test-host.html",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
