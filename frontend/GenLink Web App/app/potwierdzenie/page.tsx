import NextLink from "next/link";
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Link } from "@heroui/link";
import { Chip } from "@heroui/chip";

export default function ConfirmationPage(props: any) {
  const { searchParams } = props as { searchParams?: { eta?: string } };
  const etaParam = searchParams?.eta ?? "15";
  const etaValue = Number.parseInt(etaParam, 10);
  const eta = Number.isNaN(etaValue) ? 15 : etaValue;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 py-10">
      <Card className="border border-default-100 bg-default-50">
        <CardHeader className="flex flex-col gap-3 text-left">
          <h1 className="text-3xl font-semibold text-success-600">
            Dziękujemy!
          </h1>
          <p className="text-base text-default-600">
            Przyjęliśmy Twoje zgłoszenie. Wolontariusz GenLink skontaktuje się z
            Tobą telefonicznie w ciągu najbliższych{" "}
            <span className="font-semibold text-default-800">{eta} minut </span>
            (jest to czas orientacyjny).
          </p>
        </CardHeader>
        <CardBody className="flex flex-col gap-2 text-sm text-default-600">
          <div className="flex flex-col gap-3 rounded-lg p-1 text-sm">
            <Chip
              classNames={{ content: "font-medium" }}
              color="warning"
              size="md"
            >
              Pamiętaj!
            </Chip>
            <p className="text-default-700 font-semibold">
              Wolontariusze GenLink nigdy nie proszą o hasła, kody z SMS ani
              przelewy. Jeśli masz wątpliwości, zakończ rozmowę i skontaktuj się
              z nami pod numerem <span className="font-semibold">XXXXXXX</span>.
            </p>
          </div>
        </CardBody>
        <Divider />
        <CardFooter className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button as={NextLink} href="/" radius="lg" variant="flat">
            Wróć na stronę główną
          </Button>
          <Button as={NextLink} color="primary" href="/baza-wiedzy" radius="lg">
            Przeglądaj poradniki
          </Button>
        </CardFooter>
      </Card>
      <p className="text-center text-xs text-default-400">
        W razie pilnych pytań napisz do nas na adres{" "}
        <Link href="mailto:kontakt@genlink.pl">kontakt@genlink.pl</Link>.
      </p>
    </div>
  );
}
