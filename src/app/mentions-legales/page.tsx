import { getMarkdownContent } from "@/lib/markdown";
import MarkdownPage from "@/components/MarkdownPage";

export const metadata: import("next").Metadata = {
  title: "Mentions Légales",
  description:
    "Mentions légales du site gpformation.fr — SAS Grand Paris Formation, Aulnay-sous-Bois.",
  alternates: { canonical: "/mentions-legales" },
};

export default async function Page() {
  const { content, data } = getMarkdownContent("mentions-legales");
  return <MarkdownPage content={content} title={data.title} />;
}
