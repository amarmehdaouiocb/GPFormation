import { getMarkdownContent, getAllMarkdownSlugs } from "@/lib/markdown";
import MarkdownPage from "@/components/MarkdownPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<import("next").Metadata> {
  const { slug } = await params;
  const { data } = getMarkdownContent(`blog-${slug}`);
  const title = data.title || slug.replace(/-/g, " ");
  const description =
    data.description ||
    "Article du blog GP Formation : conseils et actualités pour devenir chauffeur TAXI ou VTC en Île-de-France.";
  return {
    title,
    description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      images: ["/opengraph-image.png"],
      type: "article",
      title,
      description,
      url: `/blog/${slug}`,
    },
  };
}

export async function generateStaticParams() {
  const slugs = getAllMarkdownSlugs("blog-");
  return slugs.map((slug) => ({
    slug: slug.replace("blog-", ""),
  }));
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const { content, data } = getMarkdownContent(`blog-${resolvedParams.slug}`);
  return <MarkdownPage content={content} title={data.title} />;
}
