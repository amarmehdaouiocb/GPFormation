import { getMarkdownContent } from "@/lib/markdown";
import HomeContent from "@/components/HomeContent";

export default async function Home() {
  const { content } = getMarkdownContent("accueil");

  return (
    <HomeContent markdownContent={content} />
  );
}
