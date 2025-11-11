import NextLink from "next/link";
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";

export default function RegistrationSuccessPage() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <Card className="border border-default-100 bg-default-50 shadow-medium">
        <CardHeader className="flex flex-col gap-2 text-left">
          <h1 className="text-2xl font-semibold text-default-900">Konto zostało utworzone!</h1>
          <p className="text-sm text-default-600">
            Możesz się teraz zalogować i rozpocząć wsparcie seniorów przez platformę GenLink.
          </p>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-3 text-sm text-default-600">
          <p>
            Witaj w społeczności GenLink. W zakładce <strong>Panel</strong> znajdziesz zgłoszenia seniorów, a w <strong>Ustawieniach</strong> możesz zgłosić swoją dostępność.
          </p>
        </CardBody>
        <Divider />
        <CardFooter>
          <Button as={NextLink} color="primary" href="/wolontariusz/login" radius="lg" size="lg">
            Przejdź do logowania
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
