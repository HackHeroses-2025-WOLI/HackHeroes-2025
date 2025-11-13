import NextLink from "next/link";
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";

import { GenPointIcon, PhoneCheckIcon } from "@/components/icons";
import {
  panelActiveRequest,
  panelCategoryLabels,
  panelContactRequests,
  panelPendingRequests,
} from "@/data/panelRequests";

const stats = [
  {
    label: "GenPoints",
    value: "128",
    hint: "Zdobyte w tym miesiącu",
    icon: GenPointIcon,
  },
  {
    label: "Rozwiązane sprawy",
    value: "42",
    hint: "Łącznie w 2025 roku",
    icon: PhoneCheckIcon,
  },
  {
    label: "Średni czas reakcji",
    value: "11 min",
    hint: "Od zgłoszenia do telefonu",
  },
];

const activeAssignment = panelActiveRequest;
const pendingRequests = panelPendingRequests.slice(0, 3);
const contactRequestsPreview = panelContactRequests.slice(0, 3);
const hasActiveAssignment = Boolean(activeAssignment);

export default function VolunteerPanelPage() {
  return (
  <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold text-default-900">Witaj w panelu wolontariusza</h1>
        <p className="text-sm text-default-500">
          Śledź swoje statystyki, odbieraj zgłoszenia i utrzymuj kontakt z seniorami w jednym miejscu.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button as={NextLink} color="primary" href="/wolontariusz/zgloszenia" radius="lg">
            Przeglądaj zgłoszenia
          </Button>
          <Button as={NextLink} href="/wolontariusz/ustawienia" radius="lg" variant="bordered">
            Ustawienia konta
          </Button>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="border border-default-100">
              <CardHeader className="flex items-center gap-3 text-sm font-medium text-default-500">
                {Icon ? (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary">
                    <Icon size={20} />
                  </span>
                ) : null}
                {item.label}
              </CardHeader>
              <CardBody className="text-3xl font-semibold text-default-900">
                {item.value}
              </CardBody>
              <CardFooter className="text-xs text-default-400">
                {item.hint}
              </CardFooter>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border border-default-100">
          <CardHeader className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold text-default-900">Twoje aktywne zgłoszenie</h2>
            <p className="text-sm text-default-500">
              Pamiętaj, aby zadzwonić w ustalonym czasie i zanotować rezultat rozmowy.
            </p>
          </CardHeader>
          <Divider />
          {activeAssignment ? (
            <CardBody className="flex flex-col gap-4 text-sm text-default-600">
              <div className="flex flex-wrap items-center gap-3">
                <Chip color="primary" variant="flat">
                  {panelCategoryLabels[activeAssignment.category]}
                </Chip>
                <Chip variant="flat">{activeAssignment.city}</Chip>
              </div>
              <div className="grid gap-2">
                <span className="text-default-800 font-medium">
                  {activeAssignment.senior} ({activeAssignment.age} lat)
                </span>
                <span>Telefon: {activeAssignment.phone}</span>
                <span>Preferowany kontakt: {activeAssignment.preferredContact}</span>
                <p className="text-default-500">{activeAssignment.description}</p>
              </div>
              <div className="rounded-2xl bg-default-50 p-4 text-xs text-default-500">
                Zapisz, ile GenPoints zdobyłeś po rozmowie – koordynator przyzna punkty po oznaczeniu sprawy jako zakończonej.
              </div>
            </CardBody>
          ) : (
            <CardBody className="text-sm text-default-500">
              Obecnie nie prowadzisz żadnego zgłoszenia. Przejrzyj listę nowych próśb i wybierz zadanie, które możesz podjąć.
            </CardBody>
          )}
          <Divider />
          <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {activeAssignment ? (
              <>
                <Button
                  as={NextLink}
                  href={`/wolontariusz/zgloszenie/${activeAssignment.id}`}
                  radius="lg"
                  variant="bordered"
                >
                  Otwórz szczegóły
                </Button>
                <div className="flex gap-2">
                  <Button radius="lg" variant="flat">
                    Oznacz jako zakończone
                  </Button>
                  <Button color="danger" radius="lg" variant="flat">
                    Anuluj podjęcie
                  </Button>
                </div>
              </>
            ) : (
              <Button as={NextLink} href="/wolontariusz/zgloszenia" radius="lg" variant="bordered">
                Przeglądaj zgłoszenia
              </Button>
            )}
          </CardFooter>
        </Card>

        <Card className="border border-default-100 bg-default-50">
          <CardHeader className="flex items-center justify-between">
            <div className="flex flex-col">
              <h2 className="text-xl font-semibold text-default-900">Nowe zgłoszenia w okolicy</h2>
              <p className="text-sm text-default-500">
                {hasActiveAssignment
                  ? "Najpierw zakończ aktywne zgłoszenie, aby przyjąć kolejne."
                  : "Wybierz zadanie, które odpowiada Twoim kompetencjom."}
              </p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="flex flex-col gap-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="rounded-2xl bg-background p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-default-800">{request.senior}</span>
                  <Chip size="sm" variant="flat">
                    {request.city}
                  </Chip>
                </div>
                <p className="mt-2 text-sm text-default-600">{request.summary}</p>
                <p className="text-xs text-default-400">Zgłoszenie dodane: {request.submittedAgo}</p>
                <Button
                  as={NextLink}
                  className="mt-3"
                  color="primary"
                  href={`/wolontariusz/zgloszenia?podejmij=${request.id}`}
                  isDisabled={hasActiveAssignment}
                  radius="lg"
                  size="sm"
                >
                  {hasActiveAssignment ? "Masz aktywne zgłoszenie" : "Podejmij"}
                </Button>
              </div>
            ))}
            {pendingRequests.length === 0 ? (
              <div className="rounded-2xl border border-default-100 bg-background p-6 text-center text-sm text-default-500">
                Wszystkie zgłoszenia zostały podjęte. Wróć tu później.
              </div>
            ) : null}
          </CardBody>
          <Divider />
          <CardFooter>
            <Button as={NextLink} href="/wolontariusz/zgloszenia" radius="lg" variant="bordered">
              Przeglądaj wszystkie zgłoszenia
            </Button>
          </CardFooter>
        </Card>
      </section>

      <section className="grid gap-6">
        <Card className="border border-default-100">
          <CardHeader className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold text-default-900">Zgłoszenia do kontaktu</h2>
            <p className="text-sm text-default-500">
              Te zgłoszenia wymagają krótkiego telefonu, aby doprecyzować temat przed przydzieleniem wolontariusza.
            </p>
          </CardHeader>
          <Divider />
          <CardBody className="grid gap-4 md:grid-cols-2">
            {contactRequestsPreview.map((request) => (
              <div key={request.id} className="rounded-2xl border border-default-100 bg-default-50 p-5">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-default-700">{request.senior}</span>
                  <span className="text-xs text-default-400">Dodano: {request.submittedAgo}</span>
                </div>
                <p className="mt-2 text-sm text-default-600">{request.summary}</p>
                <p className="mt-2 text-xs text-default-500">Telefon: {request.phone}</p>
                <Button
                  as={NextLink}
                  className="mt-3"
                  href={`/wolontariusz/zgloszenie/${request.id}`}
                  radius="lg"
                  size="sm"
                  variant="bordered"
                >
                  Otwórz szczegóły
                </Button>
              </div>
            ))}
            {contactRequestsPreview.length === 0 ? (
              <div className="rounded-2xl border border-default-100 bg-default-50 p-6 text-center text-sm text-default-500">
                Aktualnie brak zgłoszeń do kontaktu.
              </div>
            ) : null}
          </CardBody>
          <Divider />
          <CardFooter className="flex justify-end">
            <Button as={NextLink} href="/wolontariusz/zgloszenia#kontakt" radius="lg" variant="bordered">
              Wszystkie zgłoszenia do kontaktu
            </Button>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}
