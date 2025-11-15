"use client";

import { useMemo, useState } from "react";
import NextLink from "next/link";
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { Divider } from "@heroui/divider";

import { guides } from "@/data/guides";

const categories = [
  { label: "Wszystkie", value: "all" },
  { label: "Aplikacje", value: "aplikacje" },
  { label: "Bezpieczeństwo", value: "bezpieczenstwo" },
  { label: "Kontakt", value: "kontakt" },
  { label: "Płatności", value: "platnosci" },
  { label: "Inne", value: "inne" },
] as const;

export default function KnowledgeBasePage() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof categories)[number]["value"]>("all");

  const filteredGuides = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return guides.filter((guide) => {
      const matchesCategory =
        selectedCategory === "all" || guide.category === selectedCategory;
      const matchesQuery =
        !normalizedQuery ||
        guide.title.toLowerCase().includes(normalizedQuery) ||
        guide.description.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [query, selectedCategory]);

  return (
    <div className="flex flex-col gap-8 py-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-semibold">Baza wiedzy GenLink</h1>
        <p className="max-w-2xl text-sm text-default-500">
          Proste poradniki krok po kroku przygotowane z myślą o seniorach.
          Możesz przeszukiwać materiały lub filtrować je według kategorii, aby
          szybko znaleźć potrzebną instrukcję.
        </p>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Input
            className="w-full md:max-w-md"
            placeholder="Szukaj poradnika..."
            value={query}
            onValueChange={setQuery}
          />
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.value}
                color={
                  selectedCategory === category.value ? "primary" : "default"
                }
                radius="full"
                size="sm"
                variant={selectedCategory === category.value ? "solid" : "flat"}
                onPress={() => setSelectedCategory(category.value)}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredGuides.map((guide) => (
          <Card key={guide.id} className="h-full border border-default-100">
            <CardHeader className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Chip color="secondary" size="sm" variant="flat">
                  {guide.difficulty}
                </Chip>
                <Chip size="sm" variant="flat">
                  {guide.steps} kroków
                </Chip>
                <Chip size="sm" variant="flat">
                  {guide.readTimeMinutes} min
                </Chip>
              </div>
              <h2 className="text-xl font-semibold text-default-800">
                {guide.title}
              </h2>
            </CardHeader>
            <Divider />
            <CardBody className="text-sm text-default-600">
              {guide.description}
            </CardBody>
            <Divider />
            <CardFooter>
              <Button
                as={NextLink}
                color="primary"
                href={`/baza-wiedzy/${guide.id}`}
                radius="lg"
                size="sm"
                variant="flat"
              >
                Otwórz poradnik
              </Button>
            </CardFooter>
          </Card>
        ))}
        {filteredGuides.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-default-200 bg-default-50 p-10 text-center text-default-500">
            Brak poradników spełniających kryteria wyszukiwania. Spróbuj zmienić
            kategorię lub wyszukiwane hasło.
          </div>
        ) : null}
      </div>
    </div>
  );
}
