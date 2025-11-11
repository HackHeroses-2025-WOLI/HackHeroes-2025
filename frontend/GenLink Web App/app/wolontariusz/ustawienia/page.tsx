"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Checkbox } from "@heroui/checkbox";
import { Divider } from "@heroui/divider";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";

export default function VolunteerSettingsPage() {
  const [profile, setProfile] = useState({
    firstName: "Anna",
    lastName: "Kowalska",
    email: "wolontariusz@genlink.pl",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [availability, setAvailability] = useState({
    phone: true,
    onsite: false,
    hours: "Środy 16:00–18:00, soboty 10:00–12:00",
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleProfileChange = (field: keyof typeof profile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvailabilityChange = <K extends keyof typeof availability>(
    field: K,
    value: (typeof availability)[K],
  ) => {
    setAvailability((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = <K extends keyof typeof passwords>(field: K, value: (typeof passwords)[K]) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
    setPasswordError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setPasswordError(null);

    const isChangingPassword = passwords.current || passwords.next || passwords.confirm;

    if (isChangingPassword) {
      if (!passwords.current || !passwords.next || !passwords.confirm) {
        setPasswordError("Uzupełnij wszystkie pola zmiany hasła.");
        setIsSaving(false);
        return;
      }

      if (passwords.next !== passwords.confirm) {
        setPasswordError("Nowe hasła muszą być identyczne.");
        setIsSaving(false);
        return;
      }
    }

    setTimeout(() => {
      setIsSaving(false);
      if (isChangingPassword) {
        setPasswords({ current: "", next: "", confirm: "" });
      }
    }, 600);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-default-900">Ustawienia konta</h1>
        <p className="text-sm text-default-500">
          Zaktualizuj dane profilowe i zdecyduj, kiedy koordynatorzy mogą przydzielać Ci zgłoszenia.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Card className="border border-default-100">
          <CardHeader className="text-lg font-semibold text-default-900">
            Dane profilowe
          </CardHeader>
          <Divider />
          <CardBody className="grid gap-4 md:grid-cols-2">
            <Input
              isRequired
              label="Imię"
              placeholder="np. Anna"
              value={profile.firstName}
              onValueChange={(value: string) => handleProfileChange("firstName", value)}
            />
            <Input
              isRequired
              label="Nazwisko"
              placeholder="np. Kowalska"
              value={profile.lastName}
              onValueChange={(value: string) => handleProfileChange("lastName", value)}
            />
            <Input
              className="md:col-span-2"
              isRequired
              label="Adres e-mail"
              type="email"
              value={profile.email}
              onValueChange={(value: string) => handleProfileChange("email", value)}
            />
          </CardBody>
        </Card>

        <Card className="border border-default-100">
          <CardHeader className="text-lg font-semibold text-default-900">
            Zmiana hasła
          </CardHeader>
          <Divider />
          <CardBody className="grid gap-4 md:grid-cols-2">
            <Input
              className="md:col-span-2"
              label="Aktualne hasło"
              placeholder="Wpisz obecne hasło"
              type="password"
              value={passwords.current}
              isInvalid={Boolean(passwordError) && !passwords.current}
              errorMessage={passwordError ?? undefined}
              onValueChange={(value: string) => handlePasswordChange("current", value)}
            />
            <Input
              isRequired={Boolean(passwords.current || passwords.confirm)}
              label="Nowe hasło"
              placeholder="Ustal nowe hasło"
              type="password"
              value={passwords.next}
              isInvalid={Boolean(passwordError)}
              errorMessage={passwordError ?? undefined}
              onValueChange={(value: string) => handlePasswordChange("next", value)}
            />
            <Input
              isRequired={Boolean(passwords.current || passwords.next)}
              label="Potwierdź nowe hasło"
              placeholder="Powtórz nowe hasło"
              type="password"
              value={passwords.confirm}
              isInvalid={Boolean(passwordError)}
              errorMessage={passwordError ?? undefined}
              onValueChange={(value: string) => handlePasswordChange("confirm", value)}
            />
          </CardBody>
        </Card>

        <Card className="border border-default-100 bg-default-50">
          <CardHeader className="text-lg font-semibold text-default-900">
            Dostępność
          </CardHeader>
          <Divider />
          <CardBody className="flex flex-col gap-4">
            <Checkbox
              isSelected={availability.phone}
              onValueChange={(value: boolean) => handleAvailabilityChange("phone", value)}
            >
              Jestem dostępny do rozmów telefonicznych
            </Checkbox>
            <Checkbox
              isSelected={availability.onsite}
              onValueChange={(value: boolean) => handleAvailabilityChange("onsite", value)}
            >
              Mogę pomagać lokalnie (wizyty na miejscu)
            </Checkbox>
            <Textarea
              label="Stałe godziny dostępności"
              minRows={3}
              placeholder="Opisz, w jakie dni i godziny zazwyczaj możesz pomagać."
              value={availability.hours}
              onValueChange={(value: string) => handleAvailabilityChange("hours", value)}
            />
          </CardBody>
        </Card>

        <Card className="border border-default-100">
          <CardHeader className="text-lg font-semibold text-default-900">
            Powiadomienia
          </CardHeader>
          <Divider />
          <CardBody className="flex flex-col gap-3 text-sm text-default-500">
            <p>Wkrótce wprowadzimy automatyczne przypominanie o nowych zgłoszeniach i przyznanych GenPoints.</p>
            <p>Na razie powiadomienia otrzymasz mailowo od koordynatora, gdy tylko pojawi się zgłoszenie dopasowane do Twoich ustawień.</p>
          </CardBody>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            radius="lg"
            type="button"
            variant="bordered"
            onPress={() => {
              setPasswords({ current: "", next: "", confirm: "" });
              setPasswordError(null);
            }}
          >
            Anuluj
          </Button>
          <Button color="primary" isLoading={isSaving} radius="lg" type="submit">
            Zapisz zmiany
          </Button>
        </div>
      </form>
    </div>
  );
}
