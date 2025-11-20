"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Input } from "@heroui/input";

const PHONE_DIGIT_LIMIT = 9;

const formatPhoneNumber = (value: string) => {
  const digitsOnly = value.replace(/\D/g, "").slice(0, PHONE_DIGIT_LIMIT);
  const parts: string[] = [];

  for (let index = 0; index < digitsOnly.length; index += 3) {
    parts.push(digitsOnly.slice(index, index + 3));
  }

  return parts.join("-");
};

export default function VolunteerRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    city: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setPasswordError(null);

    // Miejsce na integrację z API rejestracji. Konto aktywne od razu.
    if (form.password !== form.confirmPassword) {
      setPasswordError("Hasła muszą być identyczne.");
      setIsSubmitting(false);

      return;
    }

    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/wolontariusz/rejestracja/sukces");
    }, 600);
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Card className="border border-default-100 shadow-medium">
        <CardHeader className="flex flex-col gap-2 text-left">
          <h1 className="text-2xl font-semibold text-default-900">
            Załóż konto wolontariusza
          </h1>
          <p className="text-sm text-default-500">
            Wypełnij formularz rejestracyjny. Po zapisaniu od razu możesz się
            zalogować i pomagać seniorom.
          </p>
        </CardHeader>
        <Divider />
        <form onSubmit={handleSubmit}>
          <CardBody className="grid gap-4 md:grid-cols-2">
            <Input
              isRequired
              label="Imię"
              placeholder="np. Anna"
              value={form.firstName}
              onValueChange={(value) => handleChange("firstName", value)}
            />
            <Input
              isRequired
              label="Nazwisko"
              placeholder="np. Kowalska"
              value={form.lastName}
              onValueChange={(value) => handleChange("lastName", value)}
            />
            <Input
              isRequired
              className="md:col-span-2"
              label="Adres e-mail"
              placeholder="np. anna@genlink.pl"
              type="email"
              value={form.email}
              onValueChange={(value) => handleChange("email", value)}
            />
            <Input
              isRequired
              className="md:col-span-2"
              errorMessage={passwordError ?? undefined}
              isInvalid={Boolean(passwordError)}
              label="Hasło"
              placeholder="Ustal hasło"
              type="password"
              value={form.password}
              onValueChange={(value) => {
                setPasswordError(null);
                handleChange("password", value);
              }}
            />
            <Input
              isRequired
              className="md:col-span-2"
              errorMessage={passwordError ?? undefined}
              isInvalid={Boolean(passwordError)}
              label="Potwierdź hasło"
              placeholder="Powtórz hasło"
              type="password"
              value={form.confirmPassword}
              onValueChange={(value) => {
                setPasswordError(null);
                handleChange("confirmPassword", value);
              }}
            />
            <Input
              isRequired
              label="Numer telefonu"
              placeholder="np. 600 600 600"
              inputMode="numeric"
              maxLength={11}
              type="tel"
              value={form.phone}
              onValueChange={(value) => handleChange("phone", formatPhoneNumber(value))}
            />
            <Input
              isRequired
              label="Miejscowość"
              placeholder="np. Wrocław"
              value={form.city}
              onValueChange={(value) => handleChange("city", value)}
            />
          </CardBody>
          <Divider />
          <CardFooter className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-xs text-default-400">
              Zakładając konto, potwierdzasz, że przeczytałeś(-aś) zasady
              wolontariatu GenLink.
            </p>
            <Button
              color="primary"
              isLoading={isSubmitting}
              size="lg"
              type="submit"
            >
              Zarejestruj się
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
