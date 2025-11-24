"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Input } from "@heroui/input";
import NextLink from "next/link";
import { api } from "@/lib/api";
import { ApiError } from "@/lib/api-error";
import { Alert } from "@heroui/alert";

const PHONE_DIGIT_LIMIT = 9;

const capitalizeFirstLetter = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const collapseWhitespace = (value: string) => value.replace(/\s+/g, " ").trimStart();
const trimForPayload = (value: string) => value.replace(/\s+/g, " ").trim();
const sanitizeEmail = (value: string) => value.replace(/\s+/g, "");

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
  type RegisterField = keyof typeof form;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<RegisterField, string>>
  >({});
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof typeof form, value: string) => {
    let nextValue = value;

    if (field === "firstName" || field === "lastName" || field === "city") {
      const collapsed = collapseWhitespace(value);
      nextValue = collapsed ? capitalizeFirstLetter(collapsed) : collapsed;
    }

    if (field === "email") {
      nextValue = sanitizeEmail(value);
    }

    setForm((prev) => ({
      ...prev,
      [field]: nextValue,
    }));

    setFieldErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }

      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});

    const nextFieldErrors: Partial<Record<RegisterField, string>> = {};

    if (form.password !== form.confirmPassword) {
      nextFieldErrors.password = "Hasła muszą być identyczne.";
      nextFieldErrors.confirmPassword = "Hasła muszą być identyczne.";

      setFieldErrors(nextFieldErrors);
      setIsSubmitting(false);

      return;
    }

    try {
      // send phone to the API as digits-only (e.g. 600600600), while keeping
      // the displayed value formatted as XXX-XXX-XXX in the UI
      const phoneForApi = form.phone.replace(/\D/g, "").slice(0, PHONE_DIGIT_LIMIT);

      const normalizedFirstName = trimForPayload(form.firstName);
      const normalizedLastName = trimForPayload(form.lastName);
      const normalizedCity = trimForPayload(form.city);
      const normalizedEmail = sanitizeEmail(form.email).trim();

      await api.auth.register({
        email: normalizedEmail,
        password: form.password.trim(),
        full_name: `${normalizedFirstName} ${normalizedLastName}`.trim(),
        phone: phoneForApi,
        city: normalizedCity,
      });
      router.push("/wolontariusz/rejestracja/sukces");
    } catch (err) {
      console.error(err);
      if (err instanceof ApiError) {
        const mapped: Partial<Record<RegisterField, string>> = {};

        if (err.fieldErrors.email) {
          mapped.email = err.fieldErrors.email;
        }

        if (err.fieldErrors.password) {
          mapped.password = err.fieldErrors.password;
          mapped.confirmPassword = err.fieldErrors.password;
        }

        if (err.fieldErrors.phone) {
          mapped.phone = err.fieldErrors.phone;
        }

        if (err.fieldErrors.city) {
          mapped.city = err.fieldErrors.city;
        }

        if (err.fieldErrors.full_name) {
          mapped.firstName = err.fieldErrors.full_name;
          mapped.lastName = err.fieldErrors.full_name;
        }

        if (Object.keys(mapped).length) {
          setFieldErrors(mapped);
        }

        setError(err.message);
      } else {
        setError("Rejestracja nie powiodła się. Spróbuj ponownie.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      {error && <Alert color="danger">{error}</Alert>}
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
              isInvalid={Boolean(fieldErrors.firstName)}
              errorMessage={fieldErrors.firstName}
              label="Imię"
              placeholder="np. Anna"
              value={form.firstName}
              onValueChange={(value) => handleChange("firstName", value)}
            />
            <Input
              isRequired
              isInvalid={Boolean(fieldErrors.lastName)}
              errorMessage={fieldErrors.lastName}
              label="Nazwisko"
              placeholder="np. Kowalska"
              value={form.lastName}
              onValueChange={(value) => handleChange("lastName", value)}
            />
            <Input
              isRequired
              className="md:col-span-2"
              isInvalid={Boolean(fieldErrors.email)}
              errorMessage={fieldErrors.email}
              label="Adres e-mail"
              placeholder="np. anna@genlink.pl"
              type="email"
              value={form.email}
              onValueChange={(value) => handleChange("email", value)}
            />
            <Input
              isRequired
              className="md:col-span-2"
              errorMessage={fieldErrors.password}
              isInvalid={Boolean(fieldErrors.password)}
              label="Hasło"
              placeholder="Ustal hasło"
              type="password"
              value={form.password}
              onValueChange={(value) => {
                handleChange("password", value);
              }}
            />
            <Input
              isRequired
              className="md:col-span-2"
              errorMessage={fieldErrors.confirmPassword}
              isInvalid={Boolean(fieldErrors.confirmPassword)}
              label="Potwierdź hasło"
              placeholder="Powtórz hasło"
              type="password"
              value={form.confirmPassword}
              onValueChange={(value) => {
                handleChange("confirmPassword", value);
              }}
            />
            <Input
              isRequired
              isInvalid={Boolean(fieldErrors.phone)}
              errorMessage={fieldErrors.phone}
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
              isInvalid={Boolean(fieldErrors.city)}
              errorMessage={fieldErrors.city}
              label="Miejscowość"
              placeholder="np. Wrocław"
              value={form.city}
              onValueChange={(value) => handleChange("city", value)}
            />
          </CardBody>
          <Divider />
          <CardFooter className="flex flex-col items-center gap-4 text-center md:flex-row md:items-center md:justify-between">
            <div className="space-y-1 text-xs text-default-400 md:text-left">
              <p>
                Zakładając konto, potwierdzasz, że przeczytałeś(-aś) zasady
                wolontariatu GenLink.
              </p>
            </div>
            <Button
              color="primary"
              isLoading={isSubmitting}
              size="lg"
              type="submit"
            >
              Zarejestruj się
            </Button>
          </CardFooter>
          <div className="flex flex-col items-center gap-1 pb-6 text-center text-sm text-default-500">
            <p>
              Masz już konto?{" "}
              <NextLink className="font-semibold text-primary" href="/wolontariusz/login">
                Zaloguj się
              </NextLink>
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
}
