import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { Logo } from "@/components/icons";

export const Navbar = () => {
  return (
    <HeroUINavbar isBlurred maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/2 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex items-center gap-2" href="/">
            <Logo />
            <p className="font-semibold tracking-tight text-inherit">GenLink</p>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-6">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "text-sm font-medium data-[active=true]:text-primary",
                )}
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex basis-1/2 sm:basis-full" justify="end">
        <NavbarItem className="hidden md:flex">
          <Button
            as={NextLink}
            color="primary"
            href="/pomoc"
            radius="full"
            size="md"
          >
            Potrzebuję pomocy
          </Button>
        </NavbarItem>
        <NavbarItem className="hidden md:flex">
          <Button
            as={NextLink}
            href="/wolontariusz/login"
            radius="full"
            size="md"
            variant="bordered"
          >
            Chcę pomagać
          </Button>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 justify-end gap-2" justify="end">
        <NavbarMenuToggle aria-label="Otwórz menu" className="text-primary" />
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-4 flex flex-col gap-2">
          {siteConfig.navMenuItems.map((item) => (
            <NavbarMenuItem key={item.href}>
              {item.href.startsWith("mailto:") ? (
                <Link color="foreground" href={item.href} size="lg">
                  {item.label}
                </Link>
              ) : (
                <NextLink className="text-lg text-foreground" href={item.href}>
                  {item.label}
                </NextLink>
              )}
            </NavbarMenuItem>
          ))}
        </div>
        <div className="mx-4 mt-6 flex flex-col gap-2">
          <Button as={NextLink} color="primary" href="/pomoc" radius="lg">
            Potrzebuję pomocy
          </Button>
          <Button
            as={NextLink}
            href="/wolontariusz/login"
            radius="lg"
            variant="bordered"
          >
            Chcę pomagać
          </Button>
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
