"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import clsx from "clsx";
import { Link } from "@heroui/link";

import { Navbar } from "@/components/navbar";
import { NavigationLoaderProvider } from "@/components/navigation-loader";

const COMPACT_APP_VIEW_PATHS = new Set(["/appviews/pomoc", "/appviews/potwierdzenie"]);

const normalizePathname = (pathname: string | null) => {
  if (!pathname) {
    return "/";
  }

  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname;
};

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const normalizedPath = normalizePathname(pathname);
  const isCompactAppView = COMPACT_APP_VIEW_PATHS.has(normalizedPath);

  const currentYear = useMemo(() => new Date().getFullYear(), []);

  return (
    <NavigationLoaderProvider>
      <div
        className={clsx("relative flex min-h-screen flex-col", {
          "pt-16": !isCompactAppView,
          "pt-6": isCompactAppView,
        })}
      >
        {!isCompactAppView ? <Navbar /> : null}
        <main className="container mx-auto max-w-7xl flex-grow px-6 pt-1 md:pt-1">{children}</main>
        <footer className="border-t border-default-100 bg-default-50 py-8">
          <div className="container mx-auto flex max-w-7xl flex-col gap-6 px-6 text-sm text-default-500 md:flex-row md:items-start md:justify-between">
            <div className="max-w-sm space-y-2">
              <p className="text-base font-semibold text-default-700">GenLink</p>
              <p>
                Łączymy seniorów z młodymi wolontariuszami. Pomagamy zarówno zdalnie jak i osobiście, z myślą o
                bezpieczeństwie i komforcie osób starszych.
              </p>
              <p>© {currentYear} GenLink</p>
            </div>
            {!isCompactAppView ? (
              <div className="flex flex-col gap-2 text-default-600">
                <span className="text-sm font-semibold uppercase tracking-wide text-default-700">Szybkie linki</span>
                <Link className="text-sm" href="/pomoc">
                  Formularz pomocy
                </Link>
                <Link className="text-sm" href="/baza-wiedzy">
                  Baza wiedzy
                </Link>
                <Link className="text-sm" href="/wolontariusz/login">
                  Panel wolontariusza
                </Link>
              </div>
            ) : null}
            <div className="flex flex-col gap-2 text-default-600">
              <span className="text-sm font-semibold uppercase tracking-wide text-default-700">Kontakt</span>
              <Link className="text-sm" href="mailto:kontakt@genlink.pl">
                kontakt@genlink.pl
              </Link>
              <span>Infolinia: 22 000 00 00</span>
              <span>Codziennie 9:00 – 19:00</span>
            </div>
          </div>
        </footer>
      </div>
    </NavigationLoaderProvider>
  );
}