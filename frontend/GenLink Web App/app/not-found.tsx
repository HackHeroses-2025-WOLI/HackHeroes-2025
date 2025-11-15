import NextLink from "next/link";
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Link } from "@heroui/link";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-12">
      <Card className="w-full max-w-xl border border-default-100 text-center">
        <CardHeader className="flex flex-col gap-2">
          <p className="text-2xl font-semibold uppercase tracking-wide text-primary">Ups!</p>
          <h1 className="text-xl font-semibold text-default-900">Nie znaleźliśmy takiej strony</h1>
          <p className="text-sm text-default-500">
            Upewnij się, że adres jest poprawny i spróbuj ponownie.
          </p>
        </CardHeader>
        <Divider />
        <CardBody className="flex flex-col gap-4 text-sm text-default-500">
          <p>
            Jeśli próbujesz dotrzeć do panelu wolontariusza, upewnij się, że korzystasz z adresu
            <span className="font-medium text-default-900"> wolontariusz.genlink.pl</span> lub kliknij przycisk poniżej.
          </p>
          <p>
            W razie problemów napisz do nas na adres{" "}
            <Link className="text-sm font-medium" href="mailto:kontakt@genlink.pl">
              kontakt@genlink.pl
            </Link>
            .
          </p>
        </CardBody>
        <Divider />
        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button as={NextLink} color="primary" href="/" radius="lg">
            Wróć na stronę główną
          </Button>
          <Button as={NextLink} href="/pomoc" radius="lg" variant="bordered">
            Zgłoś potrzebę
          </Button>
          <Button as={NextLink} href="/wolontariusz/login" radius="lg" variant="flat">
            Przejdź do panelu wolontariusza
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
