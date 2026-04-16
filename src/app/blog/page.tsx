import Link from "next/link";
import { getAllMarkdownSlugs, getMarkdownContent } from "@/lib/markdown";

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
    <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-8 pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 md:pb-24">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-8 sm:mb-12 text-zinc-950 dark:text-zinc-50">
        Le Blog GP Formation.
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
        {posts.map(post => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all"
          >
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2 sm:mb-3 group-hover:text-[#65BA11] transition-colors line-clamp-2">
              {post.title}
            </h2>
            <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 line-clamp-3">
              {post.description}
            </p>
            <div className="mt-5 sm:mt-6 flex items-center text-xs sm:text-sm font-medium text-[#65BA11]">
              Lire l'article &rarr;
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
