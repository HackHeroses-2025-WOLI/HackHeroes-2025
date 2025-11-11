import { redirect } from "next/navigation";

interface LegacyPanelCatchAllPageProps {
  params: {
    slug?: string[];
  };
}

export default function LegacyPanelCatchAllPage({ params }: LegacyPanelCatchAllPageProps) {
  const segments = params.slug ?? [];

  if (segments.length === 0) {
    redirect("/wolontariusz");
  }

  if (segments[0] === "nowe-zgloszenie") {
    redirect("/wolontariusz/zgloszenia");
  }

  redirect(`/wolontariusz/${segments.join("/")}`);
}
