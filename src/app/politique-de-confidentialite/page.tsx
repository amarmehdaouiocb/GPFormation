import { getMarkdownContent } from "@/lib/markdown";
import MarkdownPage from "@/components/MarkdownPage";

export default async function Page() {
  const { content, data } = getMarkdownContent("politique-de-confidentialite");
  return <MarkdownPage content={content} title={data.title} />;
}
