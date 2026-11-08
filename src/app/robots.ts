import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pintu-jawara.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/katalog", "/ajukan", "/lacak", "/offline"],
        disallow: ["/admin/", "/pimpinan/", "/api/", "/survei/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
