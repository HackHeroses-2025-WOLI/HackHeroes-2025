"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Checkbox } from "@heroui/checkbox";
import { Divider } from "@heroui/divider";
import { Input } from "@heroui/input";
import { TimeInput } from "@heroui/react";
import { Time } from "@internationalized/date";
import { Alert } from "@heroui/alert";

import { useAuth } from "@/components/auth/auth-provider";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { api } from "@/lib/api";
import type { AvailabilitySlot } from "@/types";

const DAYS_OF_WEEK = [
  { value: "1", label: "Poniedziałek", shortLabel: "Pn" },
  { value: "2", label: "Wtorek", shortLabel: "Wt" },
  { value: "3", label: "Środa", shortLabel: "Śr" },
  { value: "4", label: "Czwartek", shortLabel: "Cz" },
  { value: "5", label: "Piątek", shortLabel: "Pt" },
  { value: "6", label: "Sobota", shortLabel: "So" },
  { value: "7", label: "Niedziela", shortLabel: "Nd" },
] as const;

const DEFAULT_TIME_RANGE = {
  start: "09:00",
  end: "17:00",
};

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

const toMinutes = (value: string) => {
  const [hours, minutes] = value.split(":").map((part) => Number(part));
  return hours * 60 + minutes;
};

const formatTimeValue = (rawValue: string) => {
  const digitsOnly = rawValue.replace(/\D/g, "").slice(0, 4);

  if (digitsOnly.length === 0) {
    return "";
  }

  if (digitsOnly.length <= 2) {
    return digitsOnly;
  }

  if (digitsOnly.length === 3) {
    const hours = digitsOnly.slice(0, 1).padStart(2, "0");
    const minutes = digitsOnly.slice(1);

    return `${hours}:${minutes}`;
  }

  const hours = digitsOnly.slice(0, 2);
  const minutes = digitsOnly.slice(2);

  return `${hours}:${minutes}`;
};

const ClockCircleLinearIcon = (props: any) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 24 24"
      width="1em"
      {...props}
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l2.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
};

const timeStringToTime = (value?: string | null) => {
  if (!value) return undefined;
  const [hh, mm] = value.split(":").map((v) => Number(v));
  if (Number.isFinite(hh) && Number.isFinite(mm)) {
    try {
      return new Time(hh, mm);
    } catch (err) {
      return undefined;
    }
  }

  return undefined;
};

const timeToString = (value?: any) => {
  // support Time objects produced by https://github.com/adopted-ember-intl/intl or similar
  if (!value) return "";
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "object") {
    // The internationalized date Time has .hour and .minute
    const hour = (value.hour ?? value.hours ?? value.H ?? value.h) as number | undefined;
    const minute = (value.minute ?? value.minutes ?? value.M ?? value.m) as number | undefined;

    if (Number.isFinite(hour) && Number.isFinite(minute)) {
      return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    }
  }

  return "";
};

export default function VolunteerSettingsPage() {
  useRequireAuth();
  const { user, isLoading: authLoading, refreshProfile } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    city: "",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<Set<string>>(
    () => new Set(),
  );
  const [availabilityTypes, setAvailabilityTypes] = useState<any[] | null>(
    null,
  );
  const [selectedAvailabilityType, setSelectedAvailabilityType] =
    useState<number | null>(null);
  const [timeRange, setTimeRange] = useState({ ...DEFAULT_TIME_RANGE });
  const [isActiveNow, setIsActiveNow] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(
    null,
  );
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      setIsLoading(false);
    }
  }, [authLoading]);

  useEffect(() => {
    if (user) {
      setProfile({
        fullName: user.full_name,
        email: user.email,
        city: user.city ?? "",
      });

      let slots: AvailabilitySlot[] = [];

      if (Array.isArray(user.availability) && user.availability.length) {
        slots = user.availability;
      } else if (user.availability_json) {
        try {
          const parsed = JSON.parse(user.availability_json) as AvailabilitySlot[];
          if (Array.isArray(parsed)) {
            slots = parsed;
          }
        } catch (error) {
          console.warn("Nie udało się sparsować dostępności", error);
        }
      }

      if (slots.length) {
        const orderedDays = Array.from(
          new Set(slots.map((slot) => String(slot.day_of_week))),
        ).sort((a, b) => Number(a) - Number(b));

        setSelectedDays(new Set(orderedDays));
        setTimeRange({
          start: slots[0].start_time ?? DEFAULT_TIME_RANGE.start,
          end: slots[0].end_time ?? DEFAULT_TIME_RANGE.end,
        });
        setIsActiveNow(Boolean(user.is_active_now ?? slots.some((slot) => slot.is_active)));
      } else {
        setSelectedDays(new Set());
        setTimeRange({ ...DEFAULT_TIME_RANGE });
        setIsActiveNow(Boolean(user.is_active_now));
      }
    }
  }, [user]);

  const handleProfileChange = (field: keyof typeof profile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleDaySelection = (dayValue: string, nextValue: boolean) => {
    setSelectedDays((prev) => {
      const updated = new Set(prev);
      if (nextValue) {
        updated.add(dayValue);
      } else {
        updated.delete(dayValue);
      }
      return updated;
    });
    setAvailabilityError(null);
  };

  const handleTimeRangeChange = (
    field: keyof typeof timeRange,
    rawValue: string,
  ) => {
    const nextValue = formatTimeValue(rawValue);

    setTimeRange((prev) => ({ ...prev, [field]: nextValue }));
    setAvailabilityError(null);
  };

  const handleTimeObjectChange = (field: keyof typeof timeRange) => (
    value: any,
  ) => {
    // try to convert various value shapes to HH:MM
    const next = timeToString(value) || formatTimeValue(String(value ?? ""));
    setTimeRange((prev) => ({ ...prev, [field]: next }));
    setAvailabilityError(null);
  };

  const handlePasswordChange = <K extends keyof typeof passwords>(
    field: K,
    value: (typeof passwords)[K],
  ) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
    setPasswordError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setPasswordError(null);
    setSubmitError(null);
    setAvailabilityError(null);

    const isChangingPassword =
      passwords.current || passwords.next || passwords.confirm;

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

    // Validate required profile values
    if (!profile.city || profile.city.trim().length === 0) {
      setSubmitError("Wpisz miejscowość.");
      setIsSaving(false);

      return;
    }

    if (selectedDays.size === 0) {
      setAvailabilityError("Wybierz przynajmniej jeden dzień tygodnia.");
      setIsSaving(false);

      return;
    }

    if (
      !TIME_PATTERN.test(timeRange.start) ||
      !TIME_PATTERN.test(timeRange.end)
    ) {
      setAvailabilityError("Godziny wpisz w formacie HH:MM.");
      setIsSaving(false);

      return;
    }

    if (toMinutes(timeRange.start) >= toMinutes(timeRange.end)) {
      setAvailabilityError("Zakres godzin musi być poprawny.");
      setIsSaving(false);

      return;
    }

    const orderedDays = Array.from(selectedDays).sort(
      (a, b) => Number(a) - Number(b),
    );

    const availabilityPayload: AvailabilitySlot[] = orderedDays.map((day) => ({
      day_of_week: Number(day),
      start_time: timeRange.start,
      end_time: timeRange.end,
      is_active: true,
    }));

    try {
      await api.accounts.update({
        full_name: profile.fullName,
        city: profile.city ?? null,
        availability: availabilityPayload,
        is_active_now: isActiveNow,
      });

      if (isChangingPassword) {
        setPasswords({ current: "", next: "", confirm: "" });
      }

      await refreshProfile();
      router.push("/wolontariusz/panel");
    } catch (error) {
      console.error("Failed to save settings", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Nie udało się zapisać zmian.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div>Ładowanie ustawień...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-default-900">
          Ustawienia konta
        </h1>
        <p className="text-sm text-default-500">
          Zaktualizuj dane profilowe i zdecyduj, kiedy koordynatorzy mogą
          przydzielać Ci zgłoszenia.
        </p>
      </div>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        {submitError ? (
          <Alert color="danger" variant="flat">
            {submitError}
          </Alert>
        ) : null}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border border-default-100 h-full flex flex-col">
            <CardHeader className="text-lg font-semibold text-default-900">
              Dane profilowe
            </CardHeader>
            <Divider />
            <CardBody className="grid flex-1 gap-4 md:grid-rows-3">
              <Input
                isRequired
                label="Imię i nazwisko"
                placeholder="np. Anna Kowalska"
                value={profile.fullName}
                onValueChange={(value: string) =>
                  handleProfileChange("fullName", value)
                }
                className="md:row-start-1"
              />
              <Input
                isDisabled
                label="Adres e-mail"
                type="email"
                value={profile.email}
                onValueChange={(value: string) =>
                  handleProfileChange("email", value)
                }
                className="md:row-start-2"
              />
              <Input
                label="Miejscowość"
                isRequired
                placeholder="np. Wrocław"
                value={profile.city}
                onValueChange={(value: string) =>
                  handleProfileChange("city", value)
                }
                className="md:row-start-3"
              />
            </CardBody>
          </Card>

          <Card className="border border-default-100 h-full flex flex-col">
            <CardHeader className="text-lg font-semibold text-default-900">
              Zmiana hasła
            </CardHeader>
            <Divider />
            <CardBody className="grid flex-1 gap-4 md:grid-rows-3">
              <Input
                errorMessage={passwordError ?? undefined}
                isInvalid={Boolean(passwordError) && !passwords.current}
                label="Aktualne hasło"
                placeholder="Wpisz obecne hasło"
                type="password"
                value={passwords.current}
                onValueChange={(value: string) =>
                  handlePasswordChange("current", value)
                }
              />
              <Input
                errorMessage={passwordError ?? undefined}
                isInvalid={Boolean(passwordError)}
                isRequired={Boolean(passwords.current || passwords.confirm)}
                label="Nowe hasło"
                placeholder="Ustal nowe hasło"
                type="password"
                value={passwords.next}
                onValueChange={(value: string) =>
                  handlePasswordChange("next", value)
                }
              />
              <Input
                errorMessage={passwordError ?? undefined}
                isInvalid={Boolean(passwordError)}
                isRequired={Boolean(passwords.current || passwords.next)}
                label="Potwierdź nowe hasło"
                placeholder="Powtórz nowe hasło"
                type="password"
                value={passwords.confirm}
                onValueChange={(value: string) =>
                  handlePasswordChange("confirm", value)
                }
              />
            </CardBody>
          </Card>
        </div>

        <Card className="border border-default-100 bg-default-50">
          <CardHeader className="text-lg font-semibold text-default-900">
            Dostępność
          </CardHeader>
          <Divider />
          <CardBody className="flex flex-col gap-5">
            <div>
              <p className="text-sm font-medium text-default-700">
                Dni tygodnia
              </p>
              <p className="text-xs text-default-500">
                Zaznacz, kiedy możesz przyjmować nowe zgłoszenia.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
                {DAYS_OF_WEEK.map((day) => (
                  <Checkbox
                    key={day.value}
                    className="group inline-flex h-12 w-40 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-default-700 transition-colors duration-150 ease-in-out hover:bg-default-100 data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
                    isSelected={selectedDays.has(day.value)}
                    onValueChange={(value: boolean) =>
                      handleDaySelection(day.value, value)
                    }
                  >
                    {day.label}
                  </Checkbox>
                ))}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <TimeInput
                label="Od"
                labelPlacement="outside"
                // force Polish locale and 24-hour hourCycle to display 24h clock
                {...({ locale: "pl-PL", hourCycle: "h23" } as any)}
                startContent={
                  <ClockCircleLinearIcon className="text-xl text-default-400 pointer-events-none shrink-0" />
                }
                defaultValue={timeStringToTime(timeRange.start)}
                // ensure value updates when timeRange state changes
                value={timeStringToTime(timeRange.start) as any}
                onChange={handleTimeObjectChange("start")}
              />
              <TimeInput
                label="Do"
                labelPlacement="outside"
                {...({ locale: "pl-PL", hourCycle: "h23" } as any)}
                startContent={
                  <ClockCircleLinearIcon className="text-xl text-default-400 pointer-events-none shrink-0" />
                }
                defaultValue={timeStringToTime(timeRange.end)}
                value={timeStringToTime(timeRange.end) as any}
                onChange={handleTimeObjectChange("end")}
              />
            </div>
            <Checkbox
              isSelected={isActiveNow}
              onValueChange={(value: boolean) => setIsActiveNow(value)}
            >
              Teraz jestem aktywny
            </Checkbox>
            {availabilityError ? (
              <Alert color="warning" variant="flat">
                {availabilityError}
              </Alert>
            ) : null}
          </CardBody>
        </Card>

        <Card className="border border-default-100">
          <CardHeader className="text-lg font-semibold text-default-900">
            Powiadomienia
          </CardHeader>
          <Divider />
          <CardBody className="flex flex-col gap-3 text-sm text-default-500">
            <p>
              Wkrótce wprowadzimy automatyczne przypominanie o nowych
              zgłoszeniach i przyznanych GenPoints.
            </p>
            <p>
              Na razie powiadomienia otrzymasz mailowo od koordynatora, gdy
              tylko pojawi się zgłoszenie dopasowane do Twoich ustawień.
            </p>
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
              router.push("/wolontariusz/panel");
            }}
          >
            Anuluj
          </Button>
          <Button
            color="primary"
            isLoading={isSaving}
            radius="lg"
            type="submit"
          >
            Zapisz zmiany
          </Button>
        </div>
      </form>
    </div>
  );
}
