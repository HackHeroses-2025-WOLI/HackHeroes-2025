"use client";

import { useMemo, useState, useEffect } from "react";
import NextLink from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Alert } from "@heroui/alert";

import { getReportGroupMeta } from "@/config/report-groups";
import { api } from "@/lib/api";
import { useRequireNoActiveReport } from "@/hooks/use-require-no-active-report";
import { useReportTypes } from "@/hooks/use-report-types";
import { Report } from "@/types";

const FILTER_LAYOUT = {
  categoryWidth: 300,
};

export default function RequestsPage() {
  const { isAuthenticated, isLoading: authLoading } = useRequireNoActiveReport();
  const searchParams = useSearchParams();
  const preselectId = searchParams.get("podejmij") ?? undefined;
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const {
    reportTypes,
    isLoading: isLoadingReportTypes,
    error: reportTypesError,
  } = useReportTypes();
  
  useEffect(() => {
    if (!isAuthenticated || authLoading) {
      return;
    }

    let isMounted = true;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const loadData = async (initial = false) => {
      if (initial) {
        setIsLoading(true);
      }

      try {
        const reportsData = await api.reports.list();

        if (!isMounted) {
          return;
        }

        setReports(reportsData);
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        if (initial && isMounted) {
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

  const categories = useMemo<Array<{ label: string; value: string; description?: string }>>(() => {
    return [
      { label: "Wszystkie", value: "all" },
      ...reportTypes.map((t) => ({
        label: t.name,
        value: String(t.id),
        description: t.description ?? undefined,
      })),
    ];
  }, [reportTypes]);

  const filteredRequests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return reports.filter((request) => {
      const matchesCategory =
        selectedCategory === "all" ||
        String(request.report_type_id) === selectedCategory;
      const requestDetails = request.report_details?.toLowerCase() ?? "";
      const matchesQuery =
        !normalizedQuery ||
        request.problem.toLowerCase().includes(normalizedQuery) ||
        requestDetails.includes(normalizedQuery) ||
        request.full_name.toLowerCase().includes(normalizedQuery) ||
        request.city.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [reports, query, selectedCategory]);

  const getCategoryLabel = (id: number) => {
    const type = reportTypes.find((t) => t.id === id);
    return type ? type.name : "Inne";
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold text-default-900">
          Wszystkie dostępne zgłoszenia
        </h1>
        <p className="text-sm text-default-500">
          Filtrowanie pozwala odnaleźć prośby najlepiej pasujące do Twoich
          kompetencji.
        </p>
      </div>

      <Card className="border border-default-100">
        <CardHeader className="flex flex-col gap-4">
          <div className="flex w-full flex-col gap-3 md:flex-row md:items-end md:gap-6 md:justify-between">
            <div
              className="w-full md:flex-1 md:min-w-0"
              style={{ maxWidth: "500px" }}
            >
              <Input
                className="w-full"
                placeholder="Szukaj po imieniu seniora, mieście lub opisie"
                value={query}
                style={{ maxWidth: "500px" }}
                onValueChange={setQuery}
              />
            </div>
            <div className="w-full md:ml-auto md:flex md:w-auto md:justify-end md:flex-none">
              <Select
                className="w-full md:w-auto"
                label="Kategoria"
                placeholder="Wybierz kategorię"
                labelPlacement="outside-left"
                classNames={{
                  listbox: "max-h-[999px]",
                  popoverContent: "max-h-[999px] overflow-visible",
                }}
                isLoading={isLoadingReportTypes}
                selectedKeys={[selectedCategory]}
                style={{ width: `${FILTER_LAYOUT.categoryWidth}px` }}
                onSelectionChange={(keys) => {
                  const [value] = Array.from(keys);

                  setSelectedCategory((value as string) ?? "all");
                }}
              >
                {categories.map((category) => (
                  <SelectItem
                    key={category.value}
                    description={category.description}
                  >
                    {category.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>
          {reportTypesError ? (
            <Alert color="warning" variant="flat">
              Nie udało się pobrać listy kategorii zgłoszeń. Filtr działa w tej chwili tylko dla opcji „Wszystkie”.
            </Alert>
          ) : null}
        </CardHeader>
        <Divider />
        <CardBody className="flex flex-col gap-5">
          {isLoading ? (
            <div className="p-10 text-center text-default-500">
              Ładowanie zgłoszeń...
            </div>
          ) : (
            filteredRequests.map((request) => {
              const groupMeta = getReportGroupMeta(request.report_type_id);

              return (
                <div
                  key={request.id}
                  className={`rounded-2xl border ${
                    String(preselectId) === String(request.id)
                      ? "border-primary-200"
                      : "border-default-100"
                  } bg-default-50 p-5`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-default-700">
                        {request.full_name} ({request.age} lat)
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 sm:items-end">
                      <div className="flex flex-wrap gap-2 sm:justify-end sm:items-center">
                        <Chip
                          color={groupMeta?.color ?? "primary"}
                          size="sm"
                          variant="flat"
                        >
                          {getCategoryLabel(request.report_type_id)}
                        </Chip>
                        <Chip size="sm" variant="flat">
                          {request.city}
                        </Chip>
                        <Chip
                          className="sm:ml-2"
                          color={request.is_reviewed ? "success" : "warning"}
                          size="sm"
                          variant="flat"
                        >
                          {request.is_reviewed ? "Zweryfikowane" : "Do konsultacji"}
                        </Chip>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2 sm:max-w-2xl">
                      <h2 className="text-lg font-semibold text-default-900">
                        {request.problem}
                      </h2>
                      <p className="text-sm text-default-600">
                        {request.report_details ?? "Brak dodatkowych informacji."}
                      </p>
                    </div>
                    <Button
                      as={NextLink}
                      className="hidden self-center sm:inline-flex"
                      color="primary"
                      href={`/wolontariusz/zgloszenie/${request.id}`}
                      radius="lg"
                    >
                      Zobacz szczegóły
                    </Button>
                  </div>
                  <Button
                    as={NextLink}
                    className="mt-4 sm:hidden"
                    color="primary"
                    href={`/wolontariusz/zgloszenie/${request.id}`}
                    radius="lg"
                  >
                    Zobacz szczegóły
                  </Button>
                </div>
              );
            })
          )}
          {!isLoading && filteredRequests.length === 0 ? (
            <div className="rounded-3xl border border-default-100 bg-default-50 p-10 text-center text-default-500">
              Nie znaleziono zgłoszeń dla wybranych filtrów.
            </div>
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}
