import type { MetadataRoute } from "next";
import { getAllMarkdownSlugs } from "@/lib/markdown";

const SITE_URL = "https://www.gpformation.fr";

// Routes statiques (hors articles de blog, ajoutés dynamiquement plus bas)
const STATIC_ROUTES = [
  "",
  "/formation-taxi",
  "/formation-taxi/formation-initiale",
  "/formation-taxi/formation-continue",
  "/formation-taxi/formation-mobilite",
  "/formation-taxi/formation-passerelle",
  "/formation-vtc",
  "/formation-vtc/formation-initiale",
  "/formation-vtc/formation-continue",
  "/formation-vtc/cours-du-soir",
  "/formation-vtc/formation-distance",
  "/formation-vtc/formation-passerelle",
  "/formation-vtc/formation-vtc-93",
  "/formation-vtc/formation-vtc-en-ile-de-france",
  "/recuperation-de-points",
  "/tarifs",
  "/services",
  "/contact",
  "/devenir-chauffeur-vtc",
  "/moniteur-auto-ecole",
  "/blog",
  "/mentions-legales",
  "/cgv",
  "/politique-de-confidentialite",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const pages: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: route === "" ? 1 : route.startsWith("/formation") || route === "/tarifs" || route === "/recuperation-de-points" ? 0.8 : 0.6,
  }));

  const articles: MetadataRoute.Sitemap = getAllMarkdownSlugs("blog-").map((slug) => ({
    url: `${SITE_URL}/blog/${slug.replace(/^blog-/, "")}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...pages, ...articles];
}
