"use client";

import NextLink from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Link } from "@heroui/link";
import { Chip } from "@heroui/chip";
import { api } from "@/lib/api";
import type { AppViewsCompact, SystemStats } from "@/types";

export interface ConfirmationContentProps {
  wrapperClassName?: string;
  cardClassName?: string;
  etaMinutes?: number;
  appViewsCompact?: AppViewsCompact;
}

const DEFAULT_ETA_MINUTES = 15;

const resolveEtaMinutes = (etaMinutes?: number, etaQuery?: string | null) => {
  if (typeof etaMinutes === "number" && Number.isFinite(etaMinutes)) {
    return Math.max(1, Math.round(etaMinutes));
  }

  if (typeof etaQuery === "string" && etaQuery.trim()) {
    const parsed = Number.parseInt(etaQuery, 10);

    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return DEFAULT_ETA_MINUTES;
};

export function ConfirmationContent({
  wrapperClassName,
  cardClassName,
  etaMinutes,
  appViewsCompact = false,
}: ConfirmationContentProps) {
  const searchParams = useSearchParams();
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  useEffect(() => {
    const loadSystemStats = async () => {
      try {
        const stats = await api.system.stats();
        setSystemStats(stats);
      } catch (error) {
        console.error("Failed to load system stats", error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadSystemStats();
  }, []);

  // Use API response time if available, otherwise fall back to resolveEtaMinutes logic
  const getEtaDisplay = () => {
    if (systemStats?.average_response_time && !isLoadingStats) {
      return systemStats.average_response_time;
    }
    const fallbackEta = resolveEtaMinutes(etaMinutes, searchParams?.get("eta"));
    return `${fallbackEta} minut`;
  };

  const etaDisplay = getEtaDisplay();

  return (
    <div className={clsx("mx-auto flex w-full max-w-2xl flex-col gap-6 py-10", wrapperClassName)}>
      <Card className={clsx("border border-default-100 bg-default-50", cardClassName)}>
        <CardHeader className="flex flex-col gap-3 text-left">
          <h1 className="text-3xl font-semibold text-success-600">Dziękujemy!</h1>
          <p className="text-base text-default-600">
            Przyjęliśmy Twoje zgłoszenie. Wolontariusz GenLink skontaktuje się z Tobą telefonicznie w ciągu najbliższych
            <span className="font-semibold text-default-800"> {isLoadingStats ? "kilku minut" : etaDisplay} </span>(jest to czas orientacyjny).
          </p>
        </CardHeader>
        <CardBody className="flex flex-col gap-2 text-sm text-default-600">
          <div className="flex flex-col gap-3 rounded-lg p-1 text-sm">
            <Chip classNames={{ content: "font-medium" }} color="warning" size="md">
              Pamiętaj!
            </Chip>
            <p className="text-default-700 font-semibold">
              Wolontariusze GenLink nigdy nie proszą o hasła, kody z SMS ani przelewy. Jeśli masz wątpliwości, zakończ
              rozmowę i skontaktuj się z nami pod numerem <span className="font-semibold">XXXXXXX</span>.
            </p>
          </div>
        </CardBody>
        {!appViewsCompact ? (
          <>
            <Divider />
            <CardFooter className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button as={NextLink} href="/" radius="lg" variant="flat">
                Wróć na stronę główną
              </Button>
              <Button as={NextLink} color="primary" href="/baza-wiedzy" radius="lg">
                Przeglądaj poradniki
              </Button>
            </CardFooter>
          </>
        ) : null}
      </Card>
      <p className="text-center text-xs text-default-600">
        W razie pilnych pytań napisz do nas na adres {" "}
        <Link className="text-xs" href="mailto:kontakt@genlink.pl">kontakt@genlink.pl</Link>.
      </p>
    </div>
  );
}