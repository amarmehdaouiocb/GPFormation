import Link from "next/link";
import { getAllMarkdownSlugs, getMarkdownContent } from "@/lib/markdown";

export const metadata: import("next").Metadata = {
  title: "Actualités & Blog",
  description:
    "Le blog de GP Formation : actualités, conseils et guides pratiques pour devenir chauffeur TAXI ou VTC en Île-de-France.",
  alternates: { canonical: "/blog" },
  openGraph: {
    images: ["/opengraph-image.png"],
    title: "Actualités & Blog — GP Formation",
    description:
      "Conseils et guides pour devenir chauffeur TAXI ou VTC en Île-de-France.",
    url: "/blog",
  },
};

export default async function BlogListing() {
  const slugs = getAllMarkdownSlugs("blog-");
  
  const posts = slugs.map(slug => {
    const { data } = getMarkdownContent(slug);
    return {
      slug: slug.replace("blog-", ""),
      title: data.title || slug.replace("blog-", "").replace(/-/g, ' '),
      description: data.description || "Découvrez notre dernier article...",
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pt-32 md:pt-40 pb-24">
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-12 text-zinc-950 dark:text-zinc-50">
        Le Blog GP Formation.
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map(post => (
          <Link 
            key={post.slug} 
            href={`/blog/${post.slug}`}
            className="group p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all"
          >
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3 group-hover:text-[#65BA11] transition-colors line-clamp-2">
              {post.title}
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 line-clamp-3">
              {post.description}
            </p>
            <div className="mt-6 flex items-center text-sm font-medium text-[#65BA11]">
              Lire l'article &rarr;
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
