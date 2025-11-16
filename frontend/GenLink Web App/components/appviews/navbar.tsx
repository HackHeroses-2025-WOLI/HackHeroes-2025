"use client";

import { Navbar as HeroUINavbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/navbar";
import NextLink from "next/link";
import clsx from "clsx";
import { useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";

import { siteConfig } from "@/config/site";
import { Logo } from "@/components/icons";
import { useNavigationLoader } from "@/components/navigation-loader";

export const Navbar = () => {
  const pathname = usePathname();
  const { show: showLoader } = useNavigationLoader();

  const handleNavigate = useCallback(
    (href?: string) => {

      if (!href) {
        return;
      }

      const isInternalRoute = href.startsWith("/") && !href.startsWith("//");

      if (isInternalRoute && href !== pathname) {
        showLoader();
      }
    },
    [pathname, showLoader],
  );
  return (
    <HeroUINavbar isBlurred className={clsx("fixed w-full z-50 left-0 right-0 top-0 border-b-2 border-default-100")} maxWidth="xl" position="static">
      <NavbarContent className="w-full" justify="center">
        <div className="w-full flex items-center justify-center gap-6">
          <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink
            className="flex items-center gap-2"
            href="/"
            onClick={() => handleNavigate("/")}
          >
            <Logo />
            <p className="font-semibold tracking-tight text-inherit">GenLink</p>
          </NextLink>
          </NavbarBrand>
          <ul className="hidden lg:flex gap-6 items-center">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx("text-sm font-medium data-[active=true]:text-primary")}
                href={item.href}
                onClick={() => handleNavigate(item.href)}
              >
                {item.label}
              </NextLink>
              </NavbarItem>
            ))}
          </ul>
        </div>
      </NavbarContent>
    </HeroUINavbar>
  );
};
