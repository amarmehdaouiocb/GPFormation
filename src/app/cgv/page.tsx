import { getMarkdownContent } from "@/lib/markdown";
import MarkdownPage from "@/components/MarkdownPage";

export const metadata: import("next").Metadata = {
  title: "Conditions Générales de Vente (CGV)",
  description:
    "Conditions générales de vente des formations GP Formation : inscription, financement, paiement et modalités.",
  alternates: { canonical: "/cgv" },
};

export default async function Page() {
  const { content, data } = getMarkdownContent("cgv");
  return <MarkdownPage content={content} title={data.title} />;
}
