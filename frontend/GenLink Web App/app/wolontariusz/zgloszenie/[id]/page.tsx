"use client";

import { useEffect, useMemo, useState } from "react";
import NextLink from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Link } from "@heroui/link";

import { getReportGroupMeta } from "@/config/report-groups";
import { api } from "@/lib/api";
import { useRequireNoActiveReport } from "@/hooks/use-require-no-active-report";
import { useReportTypes } from "@/hooks/use-report-types";
import { Report, ReportType } from "@/types";

const formatPhoneNumber = (phone?: string | null) => {
  if (!phone) {
    return "";
  }

  const digits = phone.replace(/\D/g, "").slice(0, 9);
  if (!digits) {
    return phone;
  }

  const parts = digits.match(/.{1,3}/g);
  return parts ? parts.join("-") : digits;
};

export default function AssignmentPage() {
  const { isAuthenticated, isLoading: authLoading } = useRequireNoActiveReport();
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { reportTypes } = useReportTypes();

  const reportTypesMap = useMemo(() => {
    return reportTypes.reduce<Record<number, ReportType>>((memo, type) => {
      memo[type.id] = type;
      return memo;
    }, {});
  }, [reportTypes]);

  const handleAcceptReport = async () => {
    if (!report) return;
    
    setIsAccepting(true);
    try {
      await api.reports.accept(report.id);
      router.push("/wolontariusz/panel");
    } catch (error: any) {
      console.error("Failed to accept report", error);
      if (error.status === 409) {
        alert("To zgłoszenie jest już przypisane do innego wolontariusza.");
      } else if (error.status === 400) {
        alert("Masz już przypisane inne zgłoszenie. Zakończ je przed przyjęciem nowego.");
      } else {
        alert("Nie udało się przyjąć zgłoszenia. Spróbuj ponownie.");
      }
    } finally {
      setIsAccepting(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || authLoading) {
      return;
    }

    let isMounted = true;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const loadReport = async (showLoader = false) => {
      if (!params.id) {
        return;
      }

      if (showLoader) {
        setIsLoading(true);
      }

      try {
        const data = await api.reports.by_id(params.id as string);
        if (!isMounted) {
          return;
        }
        setReport(data);
        setError(null);
      } catch (err) {
        console.error("Failed to load report", err);
        if (isMounted) {
          setError("Nie udało się pobrać szczegółów zgłoszenia.");
        }
      } finally {
        if (showLoader && isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadReport(true);
    intervalId = setInterval(() => {
      loadReport(false);
    }, 2000);

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [authLoading, isAuthenticated, params.id]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-default-500">Ładowanie zgłoszenia...</div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <div className="text-danger">{error || "Zgłoszenie nie istnieje."}</div>
        <Button onPress={() => router.back()} variant="flat">
          Wróć
        </Button>
      </div>
    );
  }

  const reportGroup = getReportGroupMeta(report.report_type_id);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          as={NextLink}
          className="text-sm text-primary"
          href="/wolontariusz/zgloszenia"
        >
          ← Wróć do listy zgłoszeń
        </Link>
        <h1 className="text-3xl font-semibold text-default-900">
          {report.problem}
        </h1>
        <p className="text-sm text-default-500">
          Numer zgłoszenia: {report.id}
        </p>
      </div>

      <Card className="border border-default-100">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Chip color={reportGroup?.color ?? "primary"} variant="flat">
              {reportTypesMap[report.report_type_id]?.name ?? "Typ"}
            </Chip>
            <Chip variant="flat">{report.city}</Chip>
            <Chip variant="flat">
              {new Date(report.reported_at).toLocaleDateString("pl-PL", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Chip>
          </div>
          <div className="flex items-center">
            <Chip
              color={report.is_reviewed ? "success" : "warning"}
              variant="flat"
            >
              {report.is_reviewed ? "Zweryfikowane" : "Do konsultacji"}
            </Chip>
          </div>
        </CardHeader>
        <Divider className="h-px bg-default-100" />
        <CardBody className="flex flex-col gap-4 text-sm text-default-600">
          <div className="grid gap-2 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-default-800 font-medium">
                Zgłaszający: {report.full_name}
              </p>
              <p>
                Telefon: {" "}
                <span className="font-semibold text-default-900">
                  {formatPhoneNumber(report.phone)}
                </span>
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-default-800 font-medium">Opis:</p>
              <p>{report.report_details ?? "Brak dodatkowych informacji."}</p>
            </div>
          </div>
        </CardBody>
        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <Button 
              color="primary"
              radius="lg" 
              variant="flat"
              onPress={handleAcceptReport}
              isDisabled={isAccepting}
              isLoading={isAccepting}
            >
              Podejmij zgłoszenie
            </Button>
          </div>
          <Button
            as={NextLink}
            href="/wolontariusz/panel"
            radius="lg"
            variant="bordered"
          >
            Wróć do panelu
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
