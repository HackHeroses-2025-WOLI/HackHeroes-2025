export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "GenLink",
  description:
    "GenLink łączy seniorów z wolontariuszami technologicznymi, zapewniając szybkie i przyjazne wsparcie.",
  navItems: [
    {
      label: "Strona główna",
      href: "/",
    },
    {
      label: "Zgłoś potrzebę",
      href: "/pomoc",
    },
    {
      label: "Baza wiedzy",
      href: "/baza-wiedzy",
    },
    {
      label: "Panel wolontariusza",
      href: "/wolontariusz/login",
    },
  ],
  navMenuItems: [
    {
      label: "Strona główna",
      href: "/",
    },
    {
      label: "Zgłoś potrzebę",
      href: "/pomoc",
    },
    {
      label: "Baza wiedzy",
      href: "/baza-wiedzy",
    },
    {
      label: "Panel wolontariusza",
      href: "/wolontariusz/login",
    },
    {
      label: "Kontakt",
      href: "mailto:kontakt@genlink.pl",
    },
  ],
  links: {
    github: "https://github.com/heroui-inc/heroui",
    twitter: "https://x.com/genlink",
    docs: "mailto:kontakt@genlink.pl",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patronite.pl",
  },
};
