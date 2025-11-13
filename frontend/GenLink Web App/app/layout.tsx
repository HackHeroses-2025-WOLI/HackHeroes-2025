import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { Link } from "@heroui/link";
import clsx from "clsx";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";
import { NavigationLoaderProvider } from "@/components/navigation-loader";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="pl">
      <head />
      <body
        className={clsx(
          "min-h-screen overflow-x-hidden text-foreground bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers
          themeProps={{ attribute: "class", defaultTheme: "light", forcedTheme: "light" }}
        >
          <NavigationLoaderProvider>
            <div className="relative flex min-h-screen flex-col">
              <Navbar />
              <main className="container mx-auto max-w-7xl flex-grow px-6 pt-1 md:pt-1"/*można zmniejszyć padding top i coś */>
                {children}
              </main>
              <footer className="border-t border-default-100 bg-default-50 py-8">
                <div className="container mx-auto flex max-w-7xl flex-col gap-6 px-6 text-sm text-default-500 md:flex-row md:items-start md:justify-between">
                  <div className="max-w-sm space-y-2">
                    <p className="text-base font-semibold text-default-700">GenLink</p>
                    <p>
                      Łączymy seniorów z cierpliwymi wolontariuszami technologicznymi. Wspieramy przez telefon oraz zdalnie, zawsze krok po kroku.
                    </p>
                    <p>© {new Date().getFullYear()} GenLink</p>
                  </div>
                  <div className="flex flex-col gap-2 text-default-600">
                    <span className="text-sm font-semibold uppercase tracking-wide text-default-700">
                      Szybkie linki
                    </span>
                    <Link href="/pomoc">Formularz pomocy</Link>
                    <Link href="/baza-wiedzy">Baza wiedzy</Link>
                    <Link href="/wolontariusz/login">Panel wolontariusza</Link>
                  </div>
                  <div className="flex flex-col gap-2 text-default-600">
                    <span className="text-sm font-semibold uppercase tracking-wide text-default-700">
                      Kontakt
                    </span>
                    <Link href="mailto:kontakt@genlink.pl">kontakt@genlink.pl</Link>
                    <span>Infolinia: 22 000 00 00</span>
                    <span>Codziennie 9:00 – 19:00</span>
                  </div>
                </div>
              </footer>
            </div>
          </NavigationLoaderProvider>
        </Providers>
      </body>
    </html>
  );
}
