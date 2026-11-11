import { HomeHero } from "@/components/home/HomeHero";
import { DaysOverview, HowToExperience } from "@/components/home/HomeSections";

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <DaysOverview />
      <HowToExperience />
    </>
  );
}
