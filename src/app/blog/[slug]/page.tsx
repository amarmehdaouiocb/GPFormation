import { getMarkdownContent, getAllMarkdownSlugs } from "@/lib/markdown";
import MarkdownPage from "@/components/MarkdownPage";

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
