import { getMarkdownContent } from "@/lib/markdown";
import PricingTemplate from "@/components/PricingTemplate";

export default async function Page() {
  const { content, data } = getMarkdownContent("tarifs");
  return <PricingTemplate title={data.title || "Tarifs"} content={content} />;
}
