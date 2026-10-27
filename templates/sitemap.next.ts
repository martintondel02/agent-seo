import type { MetadataRoute } from "next";

// Next.js App Router sitemap.
//
// Rules:
// - Only public, canonical, indexable URLs.
// - `lastModified` is the real content change date, not `new Date()`.
// - Dynamic routes (courses, guides, comparisons) must be listed explicitly.
// - Keep under 50,000 URLs; split with a sitemap index if needed.

const SITE_URL = process.env.APP_URL ?? "https://example.com";

type Route = {
  path: string;
  lastModified: string;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
};

const STATIC_ROUTES: Route[] = [
  { path: "/", lastModified: "2026-10-27", changeFrequency: "weekly", priority: 1 },
  { path: "/about", lastModified: "2026-10-27", changeFrequency: "yearly", priority: 0.5 },
  { path: "/pricing", lastModified: "2026-10-27", changeFrequency: "monthly", priority: 0.8 },
];

// Example: a generated catalogue. Replace with your data source.
const ENTITY_SLUGS = ["alpha", "beta", "gamma"];
const ENTITY_UPDATED = "2026-10-27";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path === "/" ? "" : route.path}`,
    lastModified: route.lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const entityRoutes = ENTITY_SLUGS.map((slug) => ({
    url: `${SITE_URL}/items/${slug}`,
    lastModified: ENTITY_UPDATED,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...entityRoutes];
}
