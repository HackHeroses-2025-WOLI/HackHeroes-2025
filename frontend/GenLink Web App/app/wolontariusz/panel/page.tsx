"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";

import { GenPointIcon, PhoneCheckIcon } from "@/components/icons";
import { getReportGroupMeta } from "@/config/report-groups";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { Report, ReportStats } from "@/types";

export default function VolunteerPanelPage() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || authLoading) {
      return;
    }

    let isMounted = true;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const loadData = async (showLoader = false) => {
      if (showLoader) {
        setIsLoading(true);
      }

      try {
        const [statsData, reportsData] = await Promise.all([
          api.reports.stats(),
          api.reports.list({ limit: 3 }),
        ]);

        if (!isMounted) {
          return;
        }

        setStats(statsData);
        setRecentReports(reportsData);
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        if (showLoader && isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData(true);
    intervalId = setInterval(() => {
      loadData(false);
    }, 2000);

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [authLoading, isAuthenticated]);

  const dashboardStats = [
    {
      label: "GenPoints",
      value: "128", // Placeholder
      hint: "Zdobyte w tym miesiącu",
      icon: GenPointIcon,
    },
    {
      label: "Zgłoszenia w systemie",
      value: stats?.total_reports.toString() ?? "-",
      hint: "Łącznie",
      icon: PhoneCheckIcon,
    },
    {
      label: "Średni czas reakcji",
      value: "11 min", // Placeholder
      hint: "Od zgłoszenia do telefonu",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="relative flex flex-col gap-4">
        <h1 className="text-3xl font-semibold text-default-900">
          Witaj w panelu wolontariusza
        </h1>
        <p className="text-sm text-default-500">
          Śledź swoje statystyki, odbieraj zgłoszenia i utrzymuj kontakt z
          seniorami w jednym miejscu.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {dashboardStats.map((stat, index) => (
          <Card key={index} className="border border-default-100 shadow-sm">
            <CardBody className="flex flex-row items-center justify-between gap-4 p-6">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-default-500">
                  {stat.label}
                </span>
                <span className="text-2xl font-semibold text-default-900">
                  {stat.value}
                </span>
                <span className="text-xs text-default-400">{stat.hint}</span>
              </div>
              {stat.icon && (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary">
                  <stat.icon size={24} />
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-default-900">
              Oczekujące zgłoszenia
            </h2>
            <Button
              as={NextLink}
              color="primary"
              href="/wolontariusz/zgloszenia"
              variant="flat"
            >
              Zobacz wszystkie
            </Button>
          </div>

          {isLoading ? (
            <div>Ładowanie...</div>
          ) : (
            <div className="flex flex-col gap-4">
              {recentReports.map((request) => {
                const groupMeta = getReportGroupMeta(request.report_type_id);

                return (
                  <Card
                    key={request.id}
                    className="border border-default-100 shadow-sm"
                  >
                    <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-default-900">
                            {request.full_name}
                          </span>
                          <Chip size="sm" variant="flat">
                            {request.city}
                          </Chip>
                          {groupMeta ? (
                            <Chip color={groupMeta.color} size="sm" variant="flat">
                              {groupMeta.label}
                            </Chip>
                          ) : null}
                        </div>
                        <p className="text-sm text-default-500">
                          {request.problem}
                        </p>
                      </div>
                      <Button
                        as={NextLink}
                        color="primary"
                        href={`/wolontariusz/zgloszenie/${request.id}`}
                        radius="full"
                        size="sm"
                      >
                        Szczegóły
                      </Button>
                    </CardBody>
                  </Card>
                );
              })}
              {recentReports.length === 0 && (
                <div className="text-center text-default-500">
                  Brak nowych zgłoszeń.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-semibold text-default-900">
            Twoja aktywność
          </h2>
          <Card className="border border-default-100 bg-default-50 shadow-none">
            <CardBody className="p-6 text-center text-sm text-default-500">
              Tu pojawi się historia Twoich rozmów i rozwiązanych problemów.
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
