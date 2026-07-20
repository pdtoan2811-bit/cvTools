import type { MetadataRoute } from "next";

/**
 * Shared CVs are unlisted, not public: the link is the access control. Keep
 * crawlers out of both the CVs and the editor.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/$", disallow: ["/cv/", "/edit/", "/api/"] }],
  };
}
