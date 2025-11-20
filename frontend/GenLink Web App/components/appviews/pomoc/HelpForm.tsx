"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Alert } from "@heroui/alert";
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Checkbox } from "@heroui/checkbox";
import { Divider } from "@heroui/divider";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Chip } from "@heroui/chip";

import { api } from "@/lib/api";
import { ReportType, ReportStats } from "@/types";

const FORM_STORAGE_KEY = "genlink-help-form-v1";
const PHONE_DIGIT_LIMIT = 9;

interface StoredForm {
  name: string;
  phone: string;
  address: string;
  city: string;
  problem: string;
  details: string;
  age: string;
}

type FormField = keyof StoredForm;

interface HelpFormState extends StoredForm {
  remember: boolean;
}

const formatPhoneNumber = (value: string) => {
  const digitsOnly = value.replace(/\D/g, "").slice(0, PHONE_DIGIT_LIMIT);
  const parts: string[] = [];

  for (let index = 0; index < digitsOnly.length; index += 3) {
    parts.push(digitsOnly.slice(index, index + 3));
  }

  return parts.join("-");
};

const sanitizeAgeInput = (value: string) => value.replace(/\D/g, "").slice(0, 3);

export interface HelpFormProps {
  wrapperClassName?: string;
  cardClassName?: string;
  title?: ReactNode;
  description?: ReactNode;
  submitLabel?: string;
}

export function HelpForm({
  wrapperClassName,
  cardClassName,
  title = "Poproś o pomoc wolontariusza",
  description = (
    <p className="text-sm text-default-500">
      Wypełnij formularz, a wolontariusz GenLink zadzwoni do Ciebie, aby
      spokojnie dopytać o szczegóły i przeprowadzić przez rozwiązanie krok po kroku.
    </p>
  ),
  submitLabel = "Wyślij zgłoszenie",
}: HelpFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<HelpFormState>({
    name: "",
    phone: "",
    address: "",
    city: "",
    age: "",
    problem: "",
    details: "",
    remember: false,
  });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<FormField, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, typesData] = await Promise.all([
          api.reports.stats(),
          api.types.reportTypes(),
        ]);
        setStats(statsData);
        setReportTypes(typesData);
      } catch (error) {
        console.error("Failed to load initial data", error);
      } finally {
        setIsLoadingStats(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(FORM_STORAGE_KEY);

      if (!stored) {
        return;
      }

      const parsed = JSON.parse(stored) as Partial<StoredForm>;

      setFormData((prev) => ({
        ...prev,
        name: parsed.name ?? "",
        phone: parsed.phone ? formatPhoneNumber(parsed.phone) : "",
        address: parsed.address ?? "",
        city: parsed.city ?? "",
        age: sanitizeAgeInput(parsed.age ?? ""),
        problem: parsed.problem ?? "",
        details: parsed.details ?? "",
        remember: true,
      }));
    } catch {
      // Ignore - silent fail for cached form data
    }
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
        case "details": {
          if (!formData.details.trim()) {
            next.details = "Opisz krótko problem";
          } else {
            delete next.details;
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
    const trimmedDetails = formData.details.trim();
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

    if (!trimmedDetails) {
      newErrors.details = "Opisz krótko problem";
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
      const selectedType = reportTypes.find(
        (t) => String(t.id) === formData.problem
      );
      const problemSummary = selectedType ? selectedType.name : "Zgłoszenie";

      await api.reports.create({
        full_name: trimmedName,
        phone: phoneDigits,
        address: trimmedAddress,
        city: trimmedCity,
        age: parsedAge,
        problem: problemSummary,
        report_type_id: Number(formData.problem),
        report_details: trimmedDetails,
        contact_ok: true,
      });

      if (typeof window !== "undefined") {
        if (formData.remember) {
          const toStore: StoredForm = {
            name: trimmedName,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            age: String(parsedAge),
            problem: formData.problem,
            details: trimmedDetails,
          };

          window.localStorage.setItem(
            FORM_STORAGE_KEY,
            JSON.stringify(toStore)
          );
        } else {
          window.localStorage.removeItem(FORM_STORAGE_KEY);
        }
      }

      router.push(`./potwierdzenie`);
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

    return `${stats.total_reports} zgłoszeń w systemie`;
  }, [isLoadingStats, stats]);

  return (
    <div
      className={clsx(
        "mx-auto flex w-full max-w-3xl flex-col gap-6 py-8 px-4 sm:px-0 overflow-x-hidden",
        wrapperClassName,
      )}
    >
      <Card className={clsx("w-full min-w-0 border border-default-100 overflow-hidden", cardClassName)}>
        <CardHeader className="flex w-full flex-col gap-3 text-left">
          <Chip color="success" variant="flat">
            {volunteerInfo}
          </Chip>
          <h1 className="text-3xl font-semibold">{title}</h1>
          {description}
        </CardHeader>
        <Divider />
        <form className="w-full" onSubmit={handleSubmit}>
          <CardBody className="flex w-full flex-col gap-5">
            <Input
              className="w-full"
              isRequired
              errorMessage={fieldErrors.name}
              isInvalid={Boolean(fieldErrors.name)}
              label="Imię i nazwisko"
              name="name"
              placeholder="Jak możemy się do Ciebie zwracać?"
              value={formData.name}
              onBlur={() => validateField("name")}
              onValueChange={(value) => {
                setFormData((prev) => ({ ...prev, name: value }));
                clearFieldError("name");
              }}
            />
            <Input
              className="w-full"
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
                setFormData((prev) => ({ ...prev, phone: formatted }));
                clearFieldError("phone");
              }}
            />
            <Input
              className="w-full"
              isRequired
              errorMessage={fieldErrors.address}
              isInvalid={Boolean(fieldErrors.address)}
              label="Adres zamieszkania"
              name="address"
              placeholder="np. Polna 12 mieszkanie 3a"
              value={formData.address}
              onBlur={() => validateField("address")}
              onValueChange={(value) => {
                setFormData((prev) => ({ ...prev, address: value }));
                clearFieldError("address");
              }}
            />
            <Input
              className="w-full"
              isRequired
              errorMessage={fieldErrors.city}
              isInvalid={Boolean(fieldErrors.city)}
              label="Miejscowość"
              name="city"
              placeholder="np. Kraków"
              value={formData.city}
              onBlur={() => validateField("city")}
              onValueChange={(value) => {
                setFormData((prev) => ({ ...prev, city: value }));
                clearFieldError("city");
              }}
            />
            <Input
              className="w-full"
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
                setFormData((prev) => ({ ...prev, age: sanitized }));
                clearFieldError("age");
              }}
            />
            <Select
              className="w-full"
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
              {reportTypes.map((option) => (
                <SelectItem key={String(option.id)}>
                  {option.name}
                </SelectItem>
              ))}
            </Select>
            <Textarea
              className="w-full"
              isRequired
              errorMessage={fieldErrors.details}
              isInvalid={Boolean(fieldErrors.details)}
              label="Szczegóły problemu"
              name="details"
              placeholder="Opisz krótko na czym polega problem..."
              value={formData.details}
              onBlur={() => validateField("details")}
              onValueChange={(value) => {
                setFormData((prev) => ({ ...prev, details: value }));
                clearFieldError("details");
              }}
            />
            <Checkbox
              className="w-full"
              isSelected={formData.remember}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, remember: value }))
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
          <CardFooter className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-default-500">
              Przesyłając zgłoszenie potwierdzasz, że możemy zadzwonić na podany
              numer i wspólnie ustalić kolejne kroki.
            </div>
            <Button
              className="w-full sm:w-auto"
              color="primary"
              isLoading={isSubmitting}
              size="lg"
              type="submit"
            >
              {submitLabel}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}