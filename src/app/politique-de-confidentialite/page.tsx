import { getMarkdownContent } from "@/lib/markdown";
import MarkdownPage from "@/components/MarkdownPage";

export const metadata: import("next").Metadata = {
  title: "Politique de Confidentialité",
  description:
    "Politique de confidentialité et de protection des données personnelles de GP Formation.",
  alternates: { canonical: "/politique-de-confidentialite" },
};

export default async function Page() {
  const { content, data } = getMarkdownContent("politique-de-confidentialite");
  return <MarkdownPage content={content} title={data.title} />;
}
