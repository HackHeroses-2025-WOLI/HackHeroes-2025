import NextLink from "next/link";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";

const benefits = [
  {
    title: "Telefon w kilka minut",
    description:
      "Po otrzymaniu zgłoszenia wolontariusz zadzwoni do Ciebie, aby spokojnie dopytać o szczegóły i potwierdzić kolejność działań.",
  },
  {
    title: "Zaufani pomocnicy",
    description:
      "Każdy wolontariusz GenLink przechodzi weryfikację i korzysta z przygotowanych przez nas instrukcji krok po kroku.",
  },
  {
    title: "Bezpieczne wsparcie",
    description:
      "Nigdy nie prosimy o kody ani hasła. Skupiamy się na tym, by tłumaczyć technologię językiem zrozumiałym dla każdego.",
  },
];

const steps = [
  {
    label: "1. Opowiedz o swoim problemie",
    content:
      "Wypełnij krótki formularz lub zadzwoń do nas. Imię, numer telefonu i kilka słów o problemie w zupełności wystarczą.",
  },
  {
    label: "2. Połączymy Cię z wolontariuszem",
    content:
      "Dobierzemy osobę, która ma doświadczenie w Twoim temacie. Wolontariusz oddzwoni do Ciebie, aby dopytać o szczegóły i ustalić plan rozmowy.",
  },
  {
    label: "3. Rozwiążesz problem krok po kroku",
    content:
      "Wolontariusz poprowadzi Cię krok po kroku – bez pośpiechu i niezrozumiałego żargonu – aż do pełnego rozwiązania problemu.",
  },
];

export default function Home() {
  return (
    <div
      className="flex flex-col gap-16 py-4 md:py-4" /*padding do zmiany*/
    >
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-400 to-primary-600 px-6 py-16 text-center shadow-lg md:px-12">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-primary-foreground">
          <h1 className="text-balance text-4xl font-extrabold leading-tight md:text-6xl">
            GenLink łączy seniorów z wolontariuszami technologicznymi
          </h1>
          <p className="text-pretty text-lg leading-relaxed md:text-xl">
            Daj znać, z czym potrzebujesz wsparcia. Wolontariusz GenLink
            oddzwoni, aby dopytać o szczegóły i razem z Tobą przejść przez cały
            proces.
          </p>
          <div className="flex w-full flex-col items-center sm:flex-row sm:justify-center">
            <Button
              as={NextLink}
              className="w-full sm:w-auto text-lg font-semibold"
              color="secondary"
              href="/pomoc"
              radius="full"
              size="lg"
              variant="shadow"
            >
              Potrzebuję Pomocy
            </Button>
          </div>
        </div>
      </section>

      <section className="flex justify-center">
        <Card className="w-full max-w-2xl border border-default-100 bg-default-50">
          <CardBody className="flex flex-col items-center gap-3 text-center text-sm text-default-600">
            <span>
              Wolisz spróbować samodzielnie? Przygotowaliśmy proste poradniki
              krok po kroku.
            </span>
            <Button
              as={NextLink}
              color="primary"
              href="/baza-wiedzy"
              radius="full"
              size="md"
              variant="flat"
            >
              Przejdź do bazy wiedzy
            </Button>
          </CardBody>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {benefits.map((benefit) => (
          <Card
            key={benefit.title}
            className="h-full border border-default-100"
          >
            <CardHeader className="text-lg font-semibold text-primary">
              {benefit.title}
            </CardHeader>
            <CardBody className="text-sm text-default-600">
              {benefit.description}
            </CardBody>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border border-default-100">
          <CardHeader className="flex flex-col gap-2 text-left">
            <h2 className="text-2xl font-semibold">Jak to działa?</h2>
            <p className="text-sm text-default-500">
              Tylko trzy kroki dzielą Cię od rozwiązania problemu.
            </p>
          </CardHeader>
          <Divider />
          <CardBody className="flex flex-col gap-5">
            {steps.map((step) => (
              <div key={step.label} className="rounded-2xl bg-default-50 p-5">
                <h3 className="text-base font-semibold text-primary">
                  {step.label}
                </h3>
                <p className="mt-2 text-sm text-default-600">{step.content}</p>
              </div>
            ))}
          </CardBody>
        </Card>
        <Card className="border border-default-100 bg-default-50">
          <CardHeader className="flex flex-col gap-2 text-left">
            <h2 className="text-2xl font-semibold">Dla wolontariuszy</h2>
            <p className="text-sm text-default-500">
              Chcesz wykazać się swoim doświadczeniem i cierpliwością?
            </p>
          </CardHeader>
          <Divider />
          <CardBody className="flex flex-col gap-4 text-sm text-default-600">
            <p>
              W GenLink wspierasz seniorów telefonicznie lub przez wideorozmowę.
              Zapewniamy materiały, szkolenia i społeczność mentorów.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Elastyczny grafik dopasowany do Twojej dostępności.</li>
              <li>Dostęp do bazy wiedzy i scenariuszy rozmów.</li>
              <li>Spotkania integracyjne i wsparcie koordynatorów.</li>
            </ul>
            <Button
              as={NextLink}
              className="mt-2"
              color="primary"
              href="/wolontariusz/rejestracja"
              radius="lg"
            >
              Dołącz do wolontariuszy
            </Button>
          </CardBody>
        </Card>
      </section>

      <section className="rounded-3xl border border-default-100 bg-default-50 p-8 md:p-12">
        <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <h2 className="text-3xl font-semibold">
              Przygotuj się do rozmowy telefonicznej
            </h2>
            <p className="mt-3 text-base text-default-600">
              Zanim zadzwoni wolontariusz, możesz przygotować kilka rzeczy, aby
              wsparcie przebiegało szybciej i spokojniej.
            </p>
          </div>
          <ul className="space-y-3 rounded-2xl bg-background p-5 text-sm text-default-600">
            <li>Przygotuj telefon i upewnij się, że jest naładowany.</li>
            <li>
              Usiądź w spokojnym miejscu, gdzie nikt nie będzie przeszkadzał.
            </li>
            <li>
              Miej pod ręką dane logowania, jeśli będziemy je wspólnie wpisywać.
            </li>
          </ul>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            as={NextLink}
            color="primary"
            href="/pomoc"
            radius="full"
            size="lg"
          >
            Wypełnij formularz pomocy
          </Button>
          <Button
            as={NextLink}
            href="/baza-wiedzy"
            radius="full"
            size="lg"
            variant="bordered"
          >
            Zobacz poradniki krok po kroku
          </Button>
        </div>
      </section>
    </div>
  );
}
