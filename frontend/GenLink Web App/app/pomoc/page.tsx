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

const sanitizeAgeInput = (value: string) =>
  value.replace(/\D/g, "").slice(0, 3);

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
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<FormField, string>>
  >({});
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
    } catch {
      // Ignore - silent fail for cached form data
    }
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoadingStats(true);
        const response = await fetch("/api/status/aktywni", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Nie udało się pobrać danych o wolontariuszach");
        }
        const payload = (await response.json()) as VolunteerStats;

        setStats(payload);
      } catch {
        // Ignore - stats are optional
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

  const validateField = (field: FormField) => {
    setFieldErrors((prev) => {
      const next = { ...prev };

      switch (field) {
        case "name": {
          if (!formData.name.trim()) {
            next.name = "Podaj imię i nazwisko";
          } else {
            delete next.name;
          }
          break;
        }
        case "phone": {
          const phoneDigits = formData.phone.replace(/\D/g, "");

          if (phoneDigits.length !== PHONE_DIGIT_LIMIT) {
            next.phone = "Podaj poprawny numer telefonu (XXX-XXX-XXX)";
          } else {
            delete next.phone;
          }
          break;
        }
        case "address": {
          if (!formData.address.trim()) {
            next.address = "Podaj adres zamieszkania";
          } else {
            delete next.address;
          }
          break;
        }
        case "city": {
          if (!formData.city.trim()) {
            next.city = "Podaj miejscowość";
          } else {
            delete next.city;
          }
          break;
        }
        case "age": {
          const parsedAge = Number.parseInt(formData.age.trim(), 10);

          if (Number.isNaN(parsedAge) || parsedAge < 1) {
            next.age = "Podaj poprawny wiek";
          } else {
            delete next.age;
          }
          break;
        }
        case "problem": {
          if (!formData.problem) {
            next.problem = "Wybierz rodzaj problemu";
          } else {
            delete next.problem;
          }
          break;
        }
        default:
          break;
      }

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

          window.localStorage.setItem(
            FORM_STORAGE_KEY,
            JSON.stringify(toStore),
          );
        } else {
          window.localStorage.removeItem(FORM_STORAGE_KEY);
        }
      }

      router.push(`/potwierdzenie`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nieoczekiwany błąd";

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
          <h1 className="text-3xl font-semibold">
            Poproś o pomoc wolontariusza
          </h1>
          <p className="text-sm text-default-500">
            Wypełnij formularz, a wolontariusz GenLink zadzwoni do Ciebie, aby
            spokojnie dopytać o szczegóły i przeprowadzić przez rozwiązanie krok
            po kroku.
          </p>
        </CardHeader>
        <Divider />
        <form onSubmit={handleSubmit}>
          <CardBody className="flex flex-col gap-5">
            <Input
              isRequired
              errorMessage={fieldErrors.name}
              isInvalid={Boolean(fieldErrors.name)}
              label="Imię i nazwisko"
              name="name"
              placeholder="Jak możemy się do Ciebie zwracać?"
              value={formData.name}
              onBlur={() => validateField("name")}
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
              errorMessage={fieldErrors.phone}
              inputMode="numeric"
              isInvalid={Boolean(fieldErrors.phone)}
              label="Numer telefonu"
              maxLength={11}
              name="phone"
              placeholder="np. 600 600 600"
              type="tel"
              value={formData.phone}
              onBlur={() => validateField("phone")}
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
              errorMessage={fieldErrors.address}
              isInvalid={Boolean(fieldErrors.address)}
              label="Adres zamieszkania"
              name="address"
              placeholder="np. Polna 12 mieszkanie 3a"
              value={formData.address}
              onBlur={() => validateField("address")}
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
              errorMessage={fieldErrors.city}
              isInvalid={Boolean(fieldErrors.city)}
              label="Miejscowość"
              name="city"
              placeholder="np. Kraków"
              value={formData.city}
              onBlur={() => validateField("city")}
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
              errorMessage={fieldErrors.age}
              inputMode="numeric"
              isInvalid={Boolean(fieldErrors.age)}
              label="Wiek"
              maxLength={3}
              name="age"
              placeholder="np. 78"
              type="text"
              value={formData.age}
              onBlur={() => validateField("age")}
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
              errorMessage={fieldErrors.problem}
              isInvalid={Boolean(fieldErrors.problem)}
              label="Wybierz rodzaj problemu"
              placeholder="Z czym potrzebujesz pomocy?"
              selectedKeys={formData.problem ? [formData.problem] : []}
              onBlur={() => validateField("problem")}
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
              Przesyłając zgłoszenie potwierdzasz, że możemy zadzwonić na podany
              numer i wspólnie ustalić kolejne kroki.
            </div>
            <Button
              color="primary"
              isLoading={isSubmitting}
              size="lg"
              type="submit"
            >
              Wyślij zgłoszenie
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
