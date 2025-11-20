"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Checkbox } from "@heroui/checkbox";
import { Divider } from "@heroui/divider";
import { Input } from "@heroui/input";
import { Link } from "@heroui/link";
import { Alert } from "@heroui/alert";

import { useAuth } from "@/components/auth/auth-provider";
import { api } from "@/lib/api";
import { authStorage } from "@/lib/auth-storage";

export default function VolunteerLoginPage() {
  const router = useRouter();
  const { login: authenticate, isAuthenticated, isLoading: authLoading } =
    useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(
    () => authStorage.getPreferredPersistence() === "local",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.auth.login({ email, password });
      await authenticate(response.access_token, { remember: rememberMe });
      router.push("/wolontariusz/panel");
    } catch (err) {
      setError("Nieprawidłowy email lub hasło.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/wolontariusz/panel");
    }
  }, [authLoading, isAuthenticated, router]);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      {error && <Alert color="danger">{error}</Alert>}
      <Card className="border border-default-100 shadow-medium">
        <CardHeader className="flex flex-col gap-2 text-left">
          <h1 className="text-2xl font-semibold text-default-900">
            Logowanie wolontariusza
          </h1>
          <p className="text-sm text-default-500">
            Zaloguj się, aby odebrać nowe zgłoszenia i aktualizować status
            prowadzonych rozmów.
          </p>
        </CardHeader>
        <Divider />
        <form onSubmit={handleSubmit}>
          <CardBody className="flex flex-col gap-5">
            <Input
              isRequired
              label="Adres e-mail"
              placeholder="np. imie@genlink.pl"
              type="email"
              value={email}
              onValueChange={setEmail}
            />
            <Input
              isRequired
              label="Hasło"
              placeholder="Wpisz hasło"
              type="password"
              value={password}
              onValueChange={setPassword}
            />
            <Checkbox isSelected={rememberMe} onValueChange={setRememberMe}>
              Zapamiętaj mnie na tym urządzeniu
            </Checkbox>
          </CardBody>
          <Divider />
          <CardFooter className="flex flex-col gap-3">
            <Button
              color="primary"
              isLoading={isLoading}
              size="lg"
              type="submit"
            >
              Zaloguj się
            </Button>
            <p className="text-center text-sm text-default-500">
              Nie masz konta?{" "}
              <Link href="/wolontariusz/rejestracja">Zarejestruj się</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
