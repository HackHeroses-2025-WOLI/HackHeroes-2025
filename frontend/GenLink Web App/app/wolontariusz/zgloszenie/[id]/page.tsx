import NextLink from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Link } from "@heroui/link";

import { findPanelRequestById, panelCategoryLabels } from "@/data/panelRequests";

interface AssignmentPageProps {
  params: {
    id: string;
  };
}

export default function AssignmentPage({ params }: AssignmentPageProps) {
  const request = findPanelRequestById(params.id);

  if (!request) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link as={NextLink} className="text-sm text-primary" href="/wolontariusz/zgloszenia">
          ← Wróć do listy zgłoszeń
        </Link>
        <h1 className="text-3xl font-semibold text-default-900">{request.summary}</h1>
        <p className="text-sm text-default-500">Numer zgłoszenia: {request.id}</p>
      </div>

      <Card className="border border-default-100">
        <CardHeader className="flex flex-wrap items-center gap-3">
          <Chip color="primary" variant="flat">
            {panelCategoryLabels[request.category]}
          </Chip>
          <Chip variant="flat">{request.city}</Chip>
          <Chip variant="flat">{request.submittedAgo}</Chip>
        </CardHeader>
        <Divider />
        <CardBody className="flex flex-col gap-4 text-sm text-default-600">
          <div className="grid gap-2 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-default-800 font-medium">
                {request.senior} ({request.age} lat)
              </p>
              <p>
                Telefon: <span className="font-semibold text-default-900">{request.phone}</span>
              </p>
              <p>Preferowany kontakt: {request.preferredContact}</p>
            </div>
            <div className="space-y-1">
              <p className="text-default-800 font-medium">Notatki koordynatora</p>
              <p>{request.description}</p>
              {request.address ? <p>Miejsce spotkania: {request.address}</p> : null}
            </div>
          </div>
          <Divider />
          <div className="space-y-3">
            <p className="text-default-800 font-medium">Lista kroków do wykonania</p>
            <ul className="list-disc space-y-2 pl-5">
              {request.checklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </CardBody>
        <Divider />
        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <Button radius="lg" variant="flat">
              Oznacz jako zakończone
            </Button>
            <Button color="danger" radius="lg" variant="flat">
              Anuluj podjęcie
            </Button>
          </div>
          <Button as={NextLink} href="/wolontariusz/panel" radius="lg" variant="bordered">
            Wróć do panelu
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
