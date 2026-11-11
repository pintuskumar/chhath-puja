import type { MetadataRoute } from "next";
import { days } from "@/content/days";
import { SITE_URL } from "@/lib/paths";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/journey/", "/explore/", "/traditions/", ...days.map((d) => `/day/${d.slug}/`)];
  return paths.map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: "yearly", priority: p === "/" ? 1 : 0.8 }));
}
