export type ProblemOption = {
  value: string;
  label: string;
};

export const problemOptions: ProblemOption[] = [
  {
    value: "aplikacje",
    label: "Zainstalowanie i obsługa aplikacji",
  },
  {
    value: "epacjent",
    label: "Konto pacjenta / e-recepta",
  },
  {
    value: "wideorozmowa",
    label: "Połączenie wideo lub audio",
  },
  {
    value: "platnosci",
    label: "Płatności internetowe",
  },
  {
    value: "bezpieczenstwo",
    label: "Bezpieczeństwo w sieci",
  },
  {
    value: "inne",
    label: "Inny problem techniczny",
  },
];
