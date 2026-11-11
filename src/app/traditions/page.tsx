import type { Metadata } from "next";
import { TraditionsView } from "@/components/traditions/TraditionsView";

export const metadata: Metadata = {
  title: "परंपराएँ (Traditions & context)",
  description: "छठ का सांस्कृतिक संदर्भ, क्षेत्रीय भिन्नताएँ, लोकगीत, शब्दावली और स्रोत। Cultural context, regional variations, glossary and sources.",
  alternates: { canonical: "traditions/" },
};

export default function TraditionsPage() {
  return <TraditionsView />;
}
