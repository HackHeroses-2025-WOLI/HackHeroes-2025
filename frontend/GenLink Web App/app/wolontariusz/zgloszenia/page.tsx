"use client";

import { useMemo, useState } from "react";
import NextLink from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Alert } from "@heroui/alert";

import {
  panelActiveRequest,
  panelCategoryLabels,
  panelContactRequests,
  panelPendingRequests,
  type PanelRequestCategory,
} from "@/data/panelRequests";

const categories = [
  { label: "Wszystkie", value: "all" },
  { label: "IKP / e-zdrowie", value: "zdrowie" },
  { label: "Płatności", value: "platnosci" },
  { label: "Połączenia", value: "polaczenia" },
  { label: "Bezpieczeństwo", value: "bezpieczenstwo" },
];

export default function RequestsPage() {
  const searchParams = useSearchParams();
  const preselectId = searchParams.get("podejmij") ?? undefined;
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof categories)[number]["value"]>("all");
  const hasActiveAssignment = Boolean(panelActiveRequest);
  const assignableRequests = panelPendingRequests;

  const filteredRequests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return assignableRequests.filter((request) => {
      const matchesCategory =
        selectedCategory === "all" ||
        request.category === (selectedCategory as PanelRequestCategory);
      const matchesQuery =
        !normalizedQuery ||
        request.summary.toLowerCase().includes(normalizedQuery) ||
        request.description.toLowerCase().includes(normalizedQuery) ||
        request.senior.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [assignableRequests, query, selectedCategory]);

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

      {hasActiveAssignment ? (
        <Alert color="warning" title="Masz aktywne zgłoszenie">
          Zakończ bieżącą sprawę, aby przyjąć kolejne zgłoszenie.
        </Alert>
      ) : null}

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
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className={`rounded-2xl border ${preselectId === request.id ? "border-primary-200" : "border-default-100"} bg-default-50 p-5`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-default-700">
                    {request.senior} ({request.age} lat)
                  </span>
                  <span className="text-xs text-default-400">
                    Dodano: {request.submittedAgo}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Chip size="sm" variant="flat">
                    {request.city}
                  </Chip>
                  <Chip color="primary" size="sm" variant="flat">
                    {panelCategoryLabels[request.category]}
                  </Chip>
                </div>
              </div>
              <h2 className="mt-3 text-lg font-semibold text-default-900">
                {request.summary}
              </h2>
              <p className="mt-2 text-sm text-default-600">
                {request.description}
              </p>
              <Button
                as={NextLink}
                className="mt-4"
                color="primary"
                href={`/wolontariusz/zgloszenie/${request.id}`}
                isDisabled={hasActiveAssignment}
                radius="lg"
              >
                {hasActiveAssignment
                  ? "Zamknij bieżące zgłoszenie"
                  : "Podejmij zgłoszenie"}
              </Button>
            </div>
          ))}
          {filteredRequests.length === 0 ? (
            <div className="rounded-3xl border border-default-100 bg-default-50 p-10 text-center text-default-500">
              Nie znaleziono zgłoszeń dla wybranych filtrów.
            </div>
          ) : null}
        </CardBody>
      </Card>

      <Card className="border border-default-100" id="kontakt">
        <CardHeader className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-default-900">
            Zgłoszenia do kontaktu
          </h2>
          <p className="text-sm text-default-500">
            Te sprawy wymagają telefonu, aby zebrać więcej informacji zanim
            przekażemy je dalej.
          </p>
        </CardHeader>
        <Divider />
        <CardBody className="grid gap-4 md:grid-cols-2">
          {panelContactRequests.map((request) => (
            <div
              key={request.id}
              className="rounded-2xl border border-default-100 bg-default-50 p-5"
            >
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-default-700">
                  {request.senior}
                </span>
                <span className="text-xs text-default-400">
                  Dodano: {request.submittedAgo}
                </span>
              </div>
              <p className="mt-2 text-sm text-default-600">{request.summary}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-default-400">
                <span>Telefon: {request.phone}</span>
                <span>Miasto: {request.city}</span>
              </div>
              <Button
                as={NextLink}
                className="mt-4"
                href={`/wolontariusz/zgloszenie/${request.id}`}
                radius="lg"
                size="sm"
                variant="bordered"
              >
                Otwórz szczegóły
              </Button>
            </div>
          ))}
          {panelContactRequests.length === 0 ? (
            <div className="rounded-2xl border border-default-100 bg-default-50 p-6 text-center text-sm text-default-500">
              Nie ma obecnie zgłoszeń wymagających kontaktu.
            </div>
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}
