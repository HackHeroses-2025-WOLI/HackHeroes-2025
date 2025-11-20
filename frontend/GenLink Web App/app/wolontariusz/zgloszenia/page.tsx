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

import { api } from "@/lib/api";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { Report, ReportType } from "@/types";

export default function RequestsPage() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const searchParams = useSearchParams();
  const preselectId = searchParams.get("podejmij") ?? undefined;
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [reports, setReports] = useState<Report[]>([]);
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        const reportsPromise = api.reports.list();
        const typesPromise = initial ? api.types.reportTypes() : null;

        const [reportsData, typesData] = await Promise.all([
          reportsPromise,
          typesPromise ?? Promise.resolve(null),
        ]);

        if (!isMounted) {
          return;
        }

        setReports(reportsData);
        if (typesData) {
          setReportTypes(typesData);
        }
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

  const categories = useMemo(() => {
    return [
      { label: "Wszystkie", value: "all" },
      ...reportTypes.map((t) => ({ label: t.name, value: String(t.id) })),
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
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Input
              className="w-full md:max-w-lg"
              placeholder="Szukaj po imieniu seniora, mieście lub opisie"
              value={query}
              onValueChange={setQuery}
            />
            <Select
              className="md:max-w-xs"
              label="Kategoria"
              placeholder="Wybierz kategorię"
              selectedKeys={[selectedCategory]}
              onSelectionChange={(keys) => {
                const [value] = Array.from(keys);

                setSelectedCategory((value as string) ?? "all");
              }}
            >
              {categories.map((category) => (
                <SelectItem key={category.value}>{category.label}</SelectItem>
              ))}
            </Select>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="flex flex-col gap-5">
          {isLoading ? (
            <div className="p-10 text-center text-default-500">
              Ładowanie zgłoszeń...
            </div>
          ) : (
            filteredRequests.map((request) => (
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
                    <span className="text-xs text-default-400">
                      Miasto: {request.city}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Chip size="sm" variant="flat">
                      {request.city}
                    </Chip>
                    <Chip color="primary" size="sm" variant="flat">
                      {getCategoryLabel(request.report_type_id)}
                    </Chip>
                  </div>
                </div>
                <h2 className="mt-3 text-lg font-semibold text-default-900">
                  {request.problem}
                </h2>
                <p className="mt-2 text-sm text-default-600">
                  {request.report_details ?? "Brak dodatkowych informacji."}
                </p>
                <Button
                  as={NextLink}
                  className="mt-4"
                  color="primary"
                  href={`/wolontariusz/zgloszenie/${request.id}`}
                  radius="lg"
                >
                  Podejmij zgłoszenie
                </Button>
              </div>
            ))
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
