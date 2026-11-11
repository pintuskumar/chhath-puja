import type { Metadata } from "next";
import { JourneyTimeline } from "@/components/journey/JourneyTimeline";

export const metadata: Metadata = {
  title: "चार दिनों की यात्रा (The four-day journey)",
  description: "नहाय-खाय से उषा अर्घ्य तक छठ महापर्व के चारों दिनों की इंटरैक्टिव समय-रेखा। An interactive timeline of the four days of Chhath.",
  alternates: { canonical: "journey/" },
};

export default function JourneyPage() {
  return <JourneyTimeline />;
}
