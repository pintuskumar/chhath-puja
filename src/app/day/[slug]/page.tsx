import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { days, daysBySlug } from "@/content/days";
import { DayExperience } from "@/components/day/DayExperience";

export const dynamicParams = false;

export function generateStaticParams() {
  return days.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const d = daysBySlug[slug];
  if (!d) return {};
  return {
    title: `${d.title.hi} (${d.title.en}) — ${d.theme.hi}`,
    description: `${d.description.hi} ${d.description.en}`,
    alternates: { canonical: `day/${d.slug}/` },
  };
}

export default async function DayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const day = daysBySlug[slug];
  if (!day) notFound();
  return <DayExperience day={day} />;
}
