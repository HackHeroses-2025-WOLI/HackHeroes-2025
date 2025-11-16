import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { AppChrome } from "@/components/app-chrome";

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
          themeProps={{
            attribute: "class",
            defaultTheme: "light",
            forcedTheme: "light",
          }}
        >
          <AppChrome>{children}</AppChrome>
        </Providers>
      </body>
    </html>
  );
}
