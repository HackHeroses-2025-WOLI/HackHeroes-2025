import NextLink from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Link } from "@heroui/link";

import { guides } from "@/data/guides";

const categoryLabels: Record<string, string> = {
  aplikacje: "Aplikacje",
  bezpieczenstwo: "Bezpieczeństwo",
  kontakt: "Kontakt",
  platnosci: "Płatności",
  inne: "Inne",
};

interface GuidePageProps {
  params: {
    guideId: string;
  };
}

export default function GuidePage({ params }: GuidePageProps) {
  const guide = guides.find((item) => item.id === params.guideId);

  if (!guide) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 py-10">
      <div className="flex flex-col gap-3">
        <Link as={NextLink} className="text-sm text-primary" href="/baza-wiedzy">
          ← Wróć do bazy wiedzy
        </Link>
        <h1 className="text-3xl font-semibold text-default-900">{guide.title}</h1>
        <p className="text-sm text-default-500">{guide.description}</p>
        <div className="flex flex-wrap gap-2">
          <Chip color="primary" size="sm" variant="flat">
            {categoryLabels[guide.category]}
          </Chip>
          <Chip size="sm" variant="flat">
            {guide.difficulty}
          </Chip>
          <Chip size="sm" variant="flat">
            {guide.steps} kroków
          </Chip>
          <Chip size="sm" variant="flat">
            {guide.readTimeMinutes} min czytania
          </Chip>
        </div>
      </div>

      <Card className="border border-default-100">
        <CardHeader className="text-lg font-semibold">Instrukcja krok po kroku</CardHeader>
        <Divider />
        <CardBody className="flex flex-col gap-4 text-sm text-default-600">
          {guide.instructions.map((step, index) => (
            <div key={step} className="flex gap-3 rounded-2xl bg-default-50 p-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary">
                {index + 1}
              </span>
              <p className="leading-relaxed">{step}</p>
            </div>
          ))}
        </CardBody>
        {guide.resources?.length ? (
          <>
            <Divider />
            <CardFooter className="flex flex-col gap-2 text-sm text-default-500">
              <span>Przydatne linki:</span>
              <ul className="list-disc space-y-2 pl-5">
                {guide.resources.map((resource) => (
                  <li key={resource.href}>
                    <Link href={resource.href} rel="noopener noreferrer" target="_blank">
                      {resource.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </CardFooter>
          </>
        ) : null}
      </Card>

      <Card className="border border-default-100 bg-default-50">
        <CardBody className="flex flex-col gap-4 text-sm text-default-600">
          <p>
            Jeśli któryś z kroków jest niejasny, skontaktuj się z wolontariuszem GenLink.
            Chętnie przejdziemy instrukcję wspólnie przez telefon lub wideorozmowę.
          </p>
          <Button as={NextLink} color="primary" href="/pomoc" radius="lg" size="md">
            Połącz się z wolontariuszem
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
