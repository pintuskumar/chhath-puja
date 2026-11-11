import type { Metadata } from "next";
import { ObjectExplorer } from "@/components/explore/ObjectExplorer";

export const metadata: Metadata = {
  title: "पूजन सामग्री (Ritual objects)",
  description: "सूप, दउरा, ठेकुआ, नारियल, गन्ना, दीया, कलश और छठ प्रसाद — घुमाकर देखिए और जानिए। Rotate and learn about the ritual objects of Chhath.",
  alternates: { canonical: "explore/" },
};

export default function ExplorePage() {
  return <ObjectExplorer />;
}
