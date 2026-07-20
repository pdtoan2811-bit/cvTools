import type { MetadataRoute } from "next";

/**
 * Nothing here should be indexed. The app opens onto a real CV, complete with
 * a phone number and an email, and shared links are meant to be passed to a
 * person rather than found in a search result.
 */
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", disallow: "/" }] };
}
