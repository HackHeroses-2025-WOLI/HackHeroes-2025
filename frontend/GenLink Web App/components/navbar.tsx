"use client";

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
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from "@heroui/dropdown";
import NextLink from "next/link";
import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { siteConfig } from "@/config/site";
import { Logo, SettingsIcon } from "@/components/icons";
import { Avatar, AvatarGroup, AvatarIcon } from "@heroui/avatar";
import { useNavigationLoader } from "@/components/navigation-loader";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { show: showLoader } = useNavigationLoader();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const handleMenuClose = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const handleNavigate = useCallback(
    (href?: string) => {
      setIsMenuOpen(false);

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

  const renderToggleIcon = useCallback(
    (isOpen: boolean) => (
      <span className="relative flex h-6 w-6 items-center justify-center text-primary">
        <span
          className={clsx(
            "absolute h-0.5 w-6 rounded-full bg-current transition-transform duration-200 ease-in-out",
            isOpen ? "translate-y-0 rotate-45" : "-translate-y-1.5 rotate-0",
          )}
        />
        <span
          className={clsx(
            "absolute h-0.5 w-6 rounded-full bg-current transition-transform duration-200 ease-in-out",
            isOpen ? "translate-y-0 -rotate-45" : "translate-y-1.5 rotate-0",
          )}
        />
      </span>
    ),
    [],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const root = document.documentElement;

    if (isMenuOpen) {
      root.classList.add("overflow-hidden");
    } else {
      root.classList.remove("overflow-hidden");
    }

    return () => {
      root.classList.remove("overflow-hidden");
    };
  }, [isMenuOpen]);

  const isInVolunteerSettingsOrPanel = (pathname ?? "").startsWith(
    "/wolontariusz/ustawienia",
  ) || (pathname ?? "").startsWith("/wolontariusz/panel") || (pathname ?? "").startsWith("/wolontariusz/login");
  
  const isInVolunteerPanel = (pathname ?? "").startsWith(
    "/wolontariusz/panel",
  );

  const getInitials = (name?: string) => {
    if (!name) return "";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const first = parts.length > 0 ? parts[0][0].toUpperCase() : "";
    const last = parts.length > 1 ? parts[parts.length - 1][0].toUpperCase() : "";
    return `${first}${last}`;
  };

  const colorFromString = (str?: string) => {
    const s = (str || "").toString();
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
      // simple hash
      // eslint-disable-next-line no-bitwise
      hash = s.charCodeAt(i) + ((hash << 5) - hash);
    }
    // convert int hash to RGB
    // eslint-disable-next-line no-bitwise
    const r = (hash >> 24) & 0xff;
    // eslint-disable-next-line no-bitwise
    const g = (hash >> 16) & 0xff;
    // eslint-disable-next-line no-bitwise
    const b = (hash >> 8) & 0xff;
    const toHex = (v: number) => v.toString(16).padStart(2, "0");
    const hex = `#${toHex((r + 256) % 256)}${toHex((g + 256) % 256)}${toHex((b + 256) % 256)}`;
    return hex;
  };

  const getTextColorForBg = (bgHex?: string) => {
    const bg = (bgHex || "#ffffff").replace('#', '');
    const r = parseInt(bg.substring(0, 2), 16);
    const g = parseInt(bg.substring(2, 4), 16);
    const b = parseInt(bg.substring(4, 6), 16);
    // relative luminance formula (perceived brightness)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? "#111827" : "#ffffff"; // dark text for light backgrounds, else white
  };

  const userName = "Marig Howak";

  return (
    <HeroUINavbar
      isBlurred
      className={clsx("fixed w-full z-50 left-0 right-0 top-0")}
      isMenuOpen={isMenuOpen}
      maxWidth="xl"
      position="static"
      onMenuOpenChange={setIsMenuOpen}
    >
      <NavbarContent className="basis-1/2 sm:basis-full" justify="start">
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
        <ul className="hidden lg:flex gap-6">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "text-sm font-medium data-[active=true]:text-primary",
                )}
                href={item.href}
                onClick={() => handleNavigate(item.href)}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/2 sm:basis-full"
        justify="end"
      >
        {!isInVolunteerSettingsOrPanel && (
          <NavbarItem className="hidden md:flex">
            <Button
              as={NextLink}
              color="primary"
              href="/pomoc"
              radius="full"
              size="md"
              onPress={() => handleNavigate("/pomoc")}
            >
              Potrzebuję pomocy
            </Button>
          </NavbarItem>
        )}
        {!isInVolunteerSettingsOrPanel && (
          <NavbarItem className="hidden md:flex">
          <Button
            as={NextLink}
            className={
              "font-semibold text-primary border-2 border-primary/25 bg-primary/5 shadow-[0_18px_45px_rgba(37,99,235,0.18)] hover:bg-primary/10"
            }
            href="/wolontariusz/login"
            radius="full"
            size="md"
            variant="bordered"
            onPress={() => handleNavigate("/wolontariusz/login")}
          >
            Chcę pomagać
          </Button>
          </NavbarItem>
        )}
        {isInVolunteerPanel && (
          <NavbarItem className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-3">
              <Avatar 
                size="sm"
                name={userName}
                className="shadow-sm text-sm font-medium w-8 h-8" 
                showFallback
                getInitials={getInitials}
                style={{ backgroundColor: colorFromString(userName), color: getTextColorForBg(colorFromString(userName)) }}
              />
              <span className="hidden sm:inline text-base font-medium text-default-800">
                {userName}
              </span>
            </div>

            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <button
                  className="p-3 rounded-full text-default-700 hover:bg-default-100 focus:outline-none focus-visible:outline-none focus-visible:ring-0"
                  style={{ WebkitTapHighlightColor: "transparent" }}
                  aria-label="Menu konta"
                >
                  <SettingsIcon size={28} />
                </button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Menu konta" variant="faded">
                <DropdownItem
                  key="settings"
                  href="/wolontariusz/ustawienia"
                  startContent={<SettingsIcon size={16} />}
                  onPress={() => handleNavigate("/wolontariusz/ustawienia")}
                >
                  Ustawienia konta
                </DropdownItem>
                <DropdownItem
                  key="help"
                  href="/pomoc"
                  onPress={() => handleNavigate("/pomoc")}
                >
                  Pomoc i wsparcie
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  href="/wolontariusz/login"
                  className="text-danger"
                  color="danger"
                  onPress={() => handleNavigate("/wolontariusz/login")}
                >
                  Wyloguj się
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
        )}
        
      </NavbarContent>

      <NavbarContent
        className="sm:hidden basis-1 justify-end gap-2"
        justify="end"
      >
        <NavbarMenuToggle
          aria-label="Otwórz menu"
          className="text-primary"
          icon={renderToggleIcon}
        />
      </NavbarContent>

      <NavbarMenu className="sm:hidden px-0 py-0 -mt-[2px]">
        <div className="mx-5 my-4 rounded-[20px] bg-gradient-to-b from-white/95 to-white/80 p-5 shadow-[0_35px_100px_rgba(15,23,42,0.12)] ring-1 ring-white/50 backdrop-blur-lg">
          <div className="flex flex-col gap-2">
            {siteConfig.navMenuItems.map((item) => (
              <NavbarMenuItem key={item.href}>
                {item.href.startsWith("mailto:") ? (
                  <Link
                    color="foreground"
                    href={item.href}
                    size="lg"
                    onPress={handleMenuClose}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <NextLink
                    className="text-lg text-foreground"
                    href={item.href}
                    onClick={() => handleNavigate(item.href)}
                  >
                    {item.label}
                  </NextLink>
                )}
              </NavbarMenuItem>
            ))}
          </div>
          <div className="mt-6 flex flex-col gap-2">
            {!isInVolunteerSettingsOrPanel && (
              <Button
              as={NextLink}
              className="w-full font-semibold shadow-[0_25px_80px_rgba(37,99,235,0.35)]"
              color="primary"
              href="/pomoc"
              radius="lg"
              size="md"
              onPress={() => handleNavigate("/pomoc")}
            >
              Potrzebuję pomocy
            </Button>
            )}
            
            {!isInVolunteerSettingsOrPanel && (
              <Button
              as={NextLink}
              className={
                "font-semibold text-primary border-2 border-primary/25 bg-primary/5 shadow-[0_18px_45px_rgba(37,99,235,0.18)] hover:bg-primary/10"
              }
              color="default"
              href="/wolontariusz/login"
              radius="lg"
              size="md"
              variant="bordered"
              onPress={() => handleNavigate("/wolontariusz/login")}
            >
              Chcę pomagać
            </Button>
            )}
            
            
            {isInVolunteerPanel && (
              <div className="flex items-center gap-3">
                  <Avatar 
                  size="sm"
                  name={userName}
                  className="shadow-sm text-xs font-medium w-7 h-7" 
                  showFallback
                  getInitials={getInitials}
                  style={{ backgroundColor: colorFromString(userName), color: getTextColorForBg(colorFromString(userName)) }}
                />
                <span className="text-base font-medium">{userName}</span>
                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <button
                      className="p-3 rounded-lg flex items-center justify-center text-default-700 hover:bg-default-100 focus:outline-none focus-visible:outline-none focus-visible:ring-0"
                      style={{ WebkitTapHighlightColor: "transparent" }}
                      aria-label="Menu konta"
                    >
                      <SettingsIcon size={26} />
                    </button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Menu konta" variant="faded">
                    <DropdownItem
                      key="settings"
                      href="/wolontariusz/ustawienia"
                      startContent={<SettingsIcon size={16} />}
                      onPress={() => handleNavigate("/wolontariusz/ustawienia")}
                    >
                      Ustawienia konta
                    </DropdownItem>
                    <DropdownItem
                      key="help"
                      href="/pomoc"
                      onPress={() => handleNavigate("/pomoc")}
                    >
                      Pomoc i wsparcie
                    </DropdownItem>
                    <DropdownItem
                      key="logout"
                      href="/wolontariusz/login"
                      className="text-danger"
                      color="danger"
                      onPress={() => handleNavigate("/wolontariusz/login")}
                    >
                      Wyloguj się
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            )}
            
          </div>
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
