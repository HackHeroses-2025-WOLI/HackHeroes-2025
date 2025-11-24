"use client";

import { Navbar as HeroUINavbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/navbar";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { Logo } from "@/components/icons";
// Note: Navbar intentionally contains no links; navigation is disabled here

export const Navbar = () => {
  // Intentionally no navigation handlers: the header is decorative in this appviews component
  return (
    <HeroUINavbar isBlurred className={clsx("fixed w-full z-50 left-0 right-0 top-0 border-b-2 border-default-100")} maxWidth="xl" position="static">
      <NavbarContent className="w-full" justify="center">
        <div className="w-full flex items-center justify-center gap-6">
          <NavbarBrand as="li" className="gap-3 max-w-fit">
            <div className="flex items-center gap-2">
              <Logo />
              <p className="font-semibold tracking-tight text-inherit">GenLink</p>
            </div>
          </NavbarBrand>
          <ul className="hidden lg:flex gap-6 items-center ml-8">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <span className={clsx("text-sm font-medium data-[active=true]:text-primary")}>
                {item.label}
              </span>
            </NavbarItem>
          ))}
          </ul>
        </div>
      </NavbarContent>
    </HeroUINavbar>
  );
};
