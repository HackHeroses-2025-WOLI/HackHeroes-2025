"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@heroui/alert";
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Checkbox } from "@heroui/checkbox";
import { Divider } from "@heroui/divider";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Chip } from "@heroui/chip";

import { problemOptions } from "@/data/problems";

const FORM_STORAGE_KEY = "genlink-help-form-v1";

interface VolunteerStats {
  volunteers: number;
}

interface StoredForm {
  name: string;
  phone: string;
  address: string;
  city: string;
  problem: string;
  age: string;
}

type FormField = keyof StoredForm;

interface HelpFormState extends StoredForm {
  remember: boolean;
}

const PHONE_DIGIT_LIMIT = 9;

const formatPhoneNumber = (value: string) => {
  const digitsOnly = value.replace(/\D/g, "").slice(0, PHONE_DIGIT_LIMIT);
  const parts: string[] = [];

  for (let index = 0; index < digitsOnly.length; index += 3) {
    parts.push(digitsOnly.slice(index, index + 3));
  }

  return parts.join("-");
};

const sanitizeAgeInput = (value: string) => value.replace(/\D/g, "").slice(0, 3);

export default function HelpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<HelpFormState>({
    name: "",
    phone: "",
    address: "",
    city: "",
    age: "",
    problem: "",
    remember: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FormField, string>>>({});
  const [stats, setStats] = useState<VolunteerStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem(FORM_STORAGE_KEY);
    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as Partial<StoredForm>;
      setFormData((prev) => ({
        ...prev,
        name: parsed.name ?? "",
        phone: parsed.phone ? formatPhoneNumber(parsed.phone) : "",
        address: parsed.address ?? "",
        city: parsed.city ?? "",
        age: sanitizeAgeInput(parsed.age ?? ""),
        problem: parsed.problem ?? "",
        remember: true,
      }));
    } catch (error) {
      console.error("Nie udało się wczytać zapisanych danych", error);
    }
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoadingStats(true);
        const response = await fetch("/api/status/aktywni", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Nie udało się pobrać danych o wolontariuszach");
        }
        const payload = (await response.json()) as VolunteerStats;
        setStats(payload);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    void loadStats();
  }, []);

  const clearFieldError = (field: FormField) => {
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
    setSubmitError(null);

    const trimmedName = formData.name.trim();
    const trimmedAddress = formData.address.trim();
    const trimmedCity = formData.city.trim();
    const phoneDigits = formData.phone.replace(/\D/g, "");
    const parsedAge = Number.parseInt(formData.age.trim(), 10);

    const newErrors: Partial<Record<FormField, string>> = {};

    if (!trimmedName) {
      newErrors.name = "Podaj imię i nazwisko";
    }

    if (phoneDigits.length !== PHONE_DIGIT_LIMIT) {
      newErrors.phone = "Podaj numer w formacie XXX-XXX-XXX";
    }

    if (!trimmedAddress) {
      newErrors.address = "Podaj adres zamieszkania";
    }

    if (!trimmedCity) {
      newErrors.city = "Podaj miejscowość";
    }

    if (!formData.problem) {
      newErrors.problem = "Wybierz rodzaj problemu";
    }

    if (Number.isNaN(parsedAge) || parsedAge < 1) {
      newErrors.age = "Podaj poprawny wiek";
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    setFieldErrors({});

    try {
      const requestBody = {
        name: trimmedName,
        phone: phoneDigits,
        address: trimmedAddress,
        city: trimmedCity,
        age: parsedAge,
        problem: formData.problem,
      };

      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Coś poszło nie tak. Spróbuj ponownie.");
      }

      if (typeof window !== "undefined") {
        if (formData.remember) {
          const toStore: StoredForm = {
            name: requestBody.name,
            phone: formData.phone,
            address: requestBody.address,
            city: requestBody.city,
            age: String(parsedAge),
            problem: requestBody.problem,
          };
          window.localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(toStore));
        } else {
          window.localStorage.removeItem(FORM_STORAGE_KEY);
        }
      }

  router.push(`/potwierdzenie`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Nieoczekiwany błąd";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const volunteerInfo = useMemo(() => {
    if (isLoadingStats) {
      return "Trwa pobieranie...";
    }

    if (!stats) {
      return "Dane chwilowo niedostępne";
    }

    return `${stats.volunteers} wolontariuszy w gotowości`;
  }, [isLoadingStats, stats]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 py-8">
      <Card className="border border-default-100">
        <CardHeader className="flex flex-col gap-3 text-left">
          <Chip color="success" variant="flat">
            {volunteerInfo}
          </Chip>
          <h1 className="text-3xl font-semibold">Poproś o pomoc wolontariusza</h1>
          <p className="text-sm text-default-500">
            Wypełnij formularz, a wolontariusz GenLink zadzwoni do Ciebie, aby spokojnie dopytać o szczegóły i przeprowadzić przez rozwiązanie krok po kroku.
          </p>
        </CardHeader>
        <Divider />
        <form onSubmit={handleSubmit}>
          <CardBody className="flex flex-col gap-5">
            <Input
              isRequired
              label="Imię i nazwisko"
              name="name"
              placeholder="Jak możemy się do Ciebie zwracać?"
              value={formData.name}
              isInvalid={Boolean(fieldErrors.name)}
              errorMessage={fieldErrors.name}
              onValueChange={(value) => {
                setFormData((prev) => ({
                  ...prev,
                  name: value,
                }));
                clearFieldError("name");
              }}
            />
            <Input
              isRequired
              label="Numer telefonu"
              name="phone"
              placeholder="np. 600 600 600"
              type="tel"
              value={formData.phone}
              isInvalid={Boolean(fieldErrors.phone)}
              errorMessage={fieldErrors.phone}
              inputMode="numeric"
              maxLength={11}
              onValueChange={(value) => {
                const formatted = formatPhoneNumber(value);
                setFormData((prev) => ({
                  ...prev,
                  phone: formatted,
                }));
                clearFieldError("phone");
              }}
            />
            <Input
              isRequired
              label="Adres zamieszkania"
              name="address"
              placeholder="np. Polna 12 mieszkanie 3a"
              value={formData.address}
              isInvalid={Boolean(fieldErrors.address)}
              errorMessage={fieldErrors.address}
              onValueChange={(value) => {
                setFormData((prev) => ({
                  ...prev,
                  address: value,
                }));
                clearFieldError("address");
              }}
            />
            <Input
              isRequired
              label="Miejscowość"
              name="city"
              placeholder="np. Kraków"
              value={formData.city}
              isInvalid={Boolean(fieldErrors.city)}
              errorMessage={fieldErrors.city}
              onValueChange={(value) => {
                setFormData((prev) => ({
                  ...prev,
                  city: value,
                }));
                clearFieldError("city");
              }}
            />
            <Input
              isRequired
              label="Wiek"
              name="age"
              placeholder="np. 78"
              type="text"
              value={formData.age}
              isInvalid={Boolean(fieldErrors.age)}
              errorMessage={fieldErrors.age}
              inputMode="numeric"
              maxLength={3}
              onValueChange={(value) => {
                const sanitized = sanitizeAgeInput(value);
                setFormData((prev) => ({
                  ...prev,
                  age: sanitized,
                }));
                clearFieldError("age");
              }}
            />
            <Select
              isRequired
              label="Wybierz rodzaj problemu"
              placeholder="Z czym potrzebujesz pomocy?"
              selectedKeys={formData.problem ? [formData.problem] : []}
              isInvalid={Boolean(fieldErrors.problem)}
              errorMessage={fieldErrors.problem}
              onSelectionChange={(keys) => {
                const [value] = Array.from(keys);
                setFormData((prev) => ({
                  ...prev,
                  problem: (value as string) ?? "",
                }));
                clearFieldError("problem");
              }}
            >
              {problemOptions.map((option) => (
                <SelectItem key={option.value}>{option.label}</SelectItem>
              ))}
            </Select>
            <Checkbox
              isSelected={formData.remember}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  remember: value,
                }))
              }
            >
              Zapamiętaj moje dane na tym urządzeniu
            </Checkbox>
            {submitError ? (
              <Alert color="danger" title="Błąd">
                {submitError}
              </Alert>
            ) : null}
          </CardBody>
          <Divider />
          <CardFooter className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-default-500">
              Przesyłając zgłoszenie potwierdzasz, że możemy zadzwonić na podany numer i wspólnie ustalić kolejne kroki.
            </div>
            <Button color="primary" isLoading={isSubmitting} size="lg" type="submit">
              Wyślij zgłoszenie
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
