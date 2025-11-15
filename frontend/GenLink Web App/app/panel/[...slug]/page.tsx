import { redirect } from "next/navigation";

export default function LegacyPanelCatchAllPage(props: any) {
  const { params } = props as { params?: { slug?: string[] } };
  const segments = params?.slug ?? [];

  if (segments.length === 0) {
    redirect("/wolontariusz");
  }

  if (segments[0] === "nowe-zgloszenie") {
    redirect("/wolontariusz/zgloszenia");
  }

  redirect(`/wolontariusz/${segments.join("/")}`);
}
