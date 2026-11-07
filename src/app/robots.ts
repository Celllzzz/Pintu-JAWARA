import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/katalog", "/ajukan", "/lacak", "/offline"],
        disallow: ["/admin/", "/pimpinan/", "/api/", "/survei/"],
      },
    ],
    sitemap: "/sitemap.xml",
  };
}
