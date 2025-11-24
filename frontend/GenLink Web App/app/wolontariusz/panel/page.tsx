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
import { useReportTypes } from "@/hooks/use-report-types";
import { Report, ReportStats, Account } from "@/types";

export default function VolunteerPanelPage() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const [account, setAccount] = useState<Account | null>(null);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [avgResponseTime, setAvgResponseTime] = useState<number | null>(null);
  const [completedReports, setCompletedReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const { reportTypes } = useReportTypes();

  const reportTypesMap = reportTypes.reduce<Record<number, { id: number; name: string }>>( (memo, t) => {
    memo[t.id] = t;
    return memo;
  }, {} as Record<number, { id: number; name: string }> );

  const formatPhoneNumber = (phone?: string | null) => {
    if (!phone) return "";
    const digits = phone.replace(/\D/g, "").slice(0, 9);
    if (!digits) return phone;
    const parts = digits.match(/.{1,3}/g);
    return parts ? parts.join("-") : digits;
  };

  const handleCancelReport = async () => {
    if (!activeReport) return;
    
    setIsProcessing(true);
    try {
      await api.reports.active.cancel();
      // Odświeź dane
      const [accountData, statsData, reportsData, completedData] = await Promise.all([
        api.auth.me(),
        api.reports.stats(),
        api.reports.list({ limit: 3 }),
        api.reports.myCompleted({ limit: 5 }),
      ]);
      setAccount(accountData);
      setStats(statsData);
      setRecentReports(reportsData);
      setCompletedReports(completedData);
      setActiveReport(null);
    } catch (error) {
      console.error("Failed to cancel report", error);
      alert("Nie udało się anulować zgłoszenia. Spróbuj ponownie.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteReport = async () => {
    if (!activeReport) return;
    
    setIsProcessing(true);
    try {
      await api.reports.active.complete();
      // Odświeź dane
      const [accountData, statsData, reportsData, completedData] = await Promise.all([
        api.auth.me(),
        api.reports.stats(),
        api.reports.list({ limit: 3 }),
        api.reports.myCompleted({ limit: 5 }),
      ]);
      setAccount(accountData);
      setStats(statsData);
      setRecentReports(reportsData);
      setCompletedReports(completedData);
      setActiveReport(null);
    } catch (error) {
      console.error("Failed to complete report", error);
      alert("Nie udało się oznaczyć zgłoszenia jako zakończone. Spróbuj ponownie.");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || authLoading) {
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);

      try {
        const [accountData, statsData, reportsData, avgData, completedData] = await Promise.all([
          api.auth.me(),
          api.reports.stats(),
          api.reports.list({ limit: 3 }),
          api.reports.metrics.avgResponseTime(),
          api.reports.myCompleted({ limit: 5 }),
        ]);

        if (!isMounted) return;

        setAccount(accountData);
        setStats(statsData);
        setRecentReports(reportsData);
        setCompletedReports(completedData);
        // fetch active report for display if the account claims one
        if (accountData?.active_report) {
          try {
            const active = await api.reports.by_id(accountData.active_report as number);
            if (isMounted) setActiveReport(active);
          } catch (err) {
            console.warn("Failed to load active report", err);
            if (isMounted) setActiveReport(null);
          }
        } else {
          setActiveReport(null);
        }
        setAvgResponseTime(avgData?.average_response_minutes ?? null);
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [authLoading, isAuthenticated]);

  const formatAvgTime = (minutes: number | null) => {
    if (minutes === null || minutes === undefined) return "-";
    return `${Math.round(minutes)} min`;
  };

  const dashboardStats = [
    {
      label: "GenPoints",
      value: account?.genpoints?.toString() ?? "0",
      hint: "Tyle punktów uzbierałeś/aś",
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
      value: formatAvgTime(avgResponseTime),
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

      {isLoading ? (
        <div className="p-10 text-center text-default-500">Ładowanie...</div>
      ) : (
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
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {activeReport ? (
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-default-900">
                Twoje przyjęte zgłoszenie
              </h2>
            </div>
          ) : (
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
          )}

          {isLoading ? (
            <div>Ładowanie...</div>
          ) : (
            <div className="flex flex-col gap-4">
              {activeReport ? (
                <Card className="border border-default-100" key={activeReport.id}>
                  <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <Chip color={getReportGroupMeta(activeReport.report_type_id)?.color ?? "primary"} variant="flat">
                        {reportTypesMap[activeReport.report_type_id]?.name ?? "Typ"}
                      </Chip>
                      <Chip variant="flat">{activeReport.city}</Chip>
                      <Chip variant="flat">
                        {new Date(activeReport.reported_at).toLocaleDateString("pl-PL", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </Chip>
                    </div>

                    <div className="flex items-center">
                      <Chip color={activeReport.is_reviewed ? "success" : "warning"} variant="flat">
                        {activeReport.is_reviewed ? "Zweryfikowane" : "Do konsultacji"}
                      </Chip>
                    </div>
                  </CardHeader>

                  <Divider className="h-px bg-default-100" />

                  <CardBody className="flex flex-col gap-4 text-sm text-default-600">
                    <div className="grid gap-2 md:grid-cols-2">
                      <div className="space-y-1">
                        <p className="text-default-800 font-medium">Zgłaszający: {activeReport.full_name}</p>
                        <p>
                          Telefon: <span className="font-semibold text-default-900">{formatPhoneNumber(activeReport.phone)}</span>
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-default-800 font-medium">Opis:</p>
                        <p>{activeReport.report_details ?? "Brak dodatkowych informacji."}</p>
                      </div>
                    </div>
                  </CardBody>

                  <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex gap-2">
                      <Button 
                        color="danger" 
                        radius="lg" 
                        variant="flat" 
                        onPress={handleCancelReport}
                        isDisabled={isProcessing}
                        isLoading={isProcessing}
                      >
                        Anuluj zgłoszenie
                      </Button>
                      <Button 
                        className="bg-gradient-to-r from-[#b249f8] to-[#C418DB] text-white hover:opacity-90" 
                        radius="lg" 
                        onPress={handleCompleteReport}
                        isDisabled={isProcessing}
                        isLoading={isProcessing}
                      >
                        Oznacz jako zakończone
                      </Button>
                    </div>

                    <Button as={NextLink} href={`/wolontariusz/zgloszenie/${activeReport.id}`} radius="lg" variant="bordered">Szczegóły</Button>
                  </CardFooter>
                </Card>
              ) : (
                recentReports.map((request) => {
                const groupMeta = getReportGroupMeta(request.report_type_id);

                return (
                  <Card
                    key={request.id}
                    className="border border-default-100 shadow-sm"
                  >
                    <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center">
                          <span className="font-semibold text-default-900">
                            {request.full_name}
                          </span>
                          {/* group + city chips — odstęp od imienia */}
                          <div className="ml-3 flex items-center gap-2">
                            {groupMeta ? (
                              <Chip color={groupMeta.color} size="sm" variant="flat">
                                {groupMeta.label}
                              </Chip>
                            ) : null}
                            <Chip size="sm" variant="flat">
                              {request.city}
                            </Chip>
                          </div>
                        </div>

                        <p className="text-sm text-default-500">
                          {request.problem}
                        </p>
                      </div>

                      {/* right side: review chip + action button */}
                      <div className="flex items-center gap-3 self-end sm:self-auto">
                          {/* review chip: pinned then action button comes after */}
                          <div className="ml-4 sm:ml-6 flex items-center">
                            <Chip
                              color={request.is_reviewed ? "success" : "warning"}
                              size="sm"
                              variant="flat"
                            >
                              {request.is_reviewed ? "Zweryfikowane" : "Do konsultacji"}
                            </Chip>
                            <div className="ml-3">
                              <Button
                                as={NextLink}
                                color="primary"
                                href={`/wolontariusz/zgloszenie/${request.id}`}
                                radius="full"
                                size="sm"
                              >
                                Szczegóły
                              </Button>
                            </div>
                          </div>
                        {/* review chip: pinned to the right edge with extra left margin */}
                      </div>
                    </CardBody>
                  </Card>
                );
                })
              )}
              {!activeReport && recentReports.length === 0 && (
                <div className="text-center text-default-500">
                  Brak nowych zgłoszeń.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-default-900">Twoja aktywność</h2>
            {completedReports.length > 3 && (
              <Button as={NextLink} href="/wolontariusz/panel?tab=activity" variant="bordered" radius="lg">
                Zobacz wszystkie
              </Button>
            )}
          </div>
          {isLoading ? (
            <div className="text-center text-default-500">Ładowanie...</div>
          ) : completedReports.length > 0 ? (
            <div className="flex flex-col gap-3">
              {completedReports.slice(0, 3).map((report) => {
                const groupMeta = getReportGroupMeta(report.report_type_id);
                return (
                  <Card key={report.id} className="border border-default-100 shadow-sm">
                    <CardBody className="flex flex-col gap-2 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-semibold text-default-900">
                            {report.full_name}
                          </span>
                          <p className="text-xs text-default-500">
                            {report.problem}
                          </p>
                        </div>
                        {groupMeta && (
                          <Chip color={groupMeta.color} size="sm" variant="flat">
                            {groupMeta.label}
                          </Chip>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-default-400">
                          {report.city} • {new Date(report.reported_at).toLocaleDateString("pl-PL")}
                        </span>
                        <Chip color="success" size="sm" variant="flat">
                          Zakończone
                        </Chip>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border border-default-100 bg-default-50 shadow-none">
              <CardBody className="p-6 text-center text-sm text-default-500">
                Nie masz jeszcze rozwiązanych zgłoszeń.
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
