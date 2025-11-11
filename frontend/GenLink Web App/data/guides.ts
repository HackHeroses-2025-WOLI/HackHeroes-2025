interface GuideResource {
  label: string;
  href: string;
}

export interface KnowledgeGuide {
  id: string;
  title: string;
  description: string;
  category: "aplikacje" | "bezpieczenstwo" | "kontakt" | "platnosci" | "inne";
  readTimeMinutes: number;
  difficulty: "łatwy" | "średni";
  steps: number;
  instructions: string[];
  resources?: GuideResource[];
}

export const guides: KnowledgeGuide[] = [
  {
    id: "wideorozmowa",
    title: "Jak odebrać wideorozmowę na smartfonie",
    description:
      "Dowiedz się, jak krok po kroku odebrać połączenie wideo, włączyć kamerę i regulować głośność.",
    category: "kontakt",
    readTimeMinutes: 5,
    difficulty: "łatwy",
    steps: 6,
    instructions: [
      "Upewnij się, że telefon jest podłączony do internetu (Wi-Fi lub dane komórkowe).",
      "Kiedy ktoś dzwoni, przesuń zieloną słuchawkę w górę lub naciśnij przycisk Ode odbierz.",
      "Jeśli aplikacja zapyta o dostęp do mikrofonu i kamery, wybierz Pozwól.",
      "Po odebraniu dotknij ikony kamery, aby włączyć obraz i sprawdzić, czy jesteś widoczny.",
      "Ustaw głośność bocznymi przyciskami. Gdy rozmowa się zacina, zbliż się do routera Wi-Fi.",
      "Aby zakończyć rozmowę, dotknij czerwonej słuchawki i upewnij się, że aplikacja została zamknięta.",
    ],
    resources: [
      {
        label: "Instrukcja Google Meet",
        href: "https://support.google.com/meet/answer/7291339?hl=pl",
      },
    ],
  },
  {
    id: "epacjent-rejestracja",
    title: "Zakładanie konta Internetowe Konto Pacjenta",
    description:
      "Instrukcja tworzenia profilu w IKP oraz aktywacji powiadomień o receptach i skierowaniach.",
    category: "aplikacje",
    readTimeMinutes: 8,
    difficulty: "średni",
    steps: 7,
    instructions: [
      "Wejdź na stronę pacjent.gov.pl i wybierz przycisk Zaloguj się lub załóż konto.",
      "Zaloguj się profilem zaufanym, bankowością elektroniczną lub e-dowodem.",
      "Po zalogowaniu uzupełnij dane kontaktowe: numer telefonu i adres e-mail.",
      "Włącz powiadomienia o nowych receptach i skierowaniach, zaznaczając odpowiednie pola.",
      "Sprawdź zakładkę Moje konto i potwierdź poprawność danych osobowych.",
      "Dodaj upoważnioną osobę, jeśli ktoś z rodziny ma odbierać recepty w Twoim imieniu.",
      "Zapisz zmiany i wyloguj się, klikając nazwę profilu w prawym górnym rogu.",
    ],
    resources: [
      {
        label: "Pomoc IKP",
        href: "https://pacjent.gov.pl/pomoc",
      },
    ],
  },
  {
    id: "blik",
    title: "Jak zapłacić BLIK-iem w sklepie internetowym",
    description:
      "Bezpieczne płatności online przy użyciu kodu BLIK i zatwierdzania w aplikacji banku.",
    category: "platnosci",
    readTimeMinutes: 6,
    difficulty: "średni",
    steps: 5,
    instructions: [
      "Podczas płatności w sklepie internetowym wybierz opcję BLIK.",
      "Otwórz aplikację banku na telefonie i wygeneruj nowy sześciocyfrowy kod BLIK.",
      "Przepisz kod na stronie sklepu w pole BLIK i zatwierdź.",
      "W aplikacji banku potwierdź transakcję, sprawdzając kwotę i nazwę sklepu.",
      "Po akceptacji poczekaj na potwierdzenie w sklepie i zachowaj e-mail z potwierdzeniem zakupu.",
    ],
    resources: [
      {
        label: "Oficjalna strona BLIK",
        href: "https://www.blik.com/",
      },
    ],
  },
  {
    id: "hasla",
    title: "Tworzenie i zapisywanie mocnych haseł",
    description:
      "Poznaj proste zasady, które pozwolą zadbać o bezpieczeństwo Twoich kont i dokumentów.",
    category: "bezpieczenstwo",
    readTimeMinutes: 4,
    difficulty: "łatwy",
    steps: 4,
    instructions: [
      "Wybierz hasło złożone z co najmniej 12 znaków, łącząc litery, cyfry i symbole.",
      "Nie używaj łatwych do odgadnięcia informacji, takich jak data urodzenia czy imię wnuka.",
      "Zapisz hasło w bezpiecznym notesie albo użyj menedżera haseł z zaufanego źródła.",
      "Regularnie zmieniaj hasła do ważnych kont, zwłaszcza banku i poczty.",
    ],
    resources: [
      {
        label: "Poradnik CERT Polska",
        href: "https://www.gov.pl/web/cyfryzacja/bezpieczne-hasla",
      },
    ],
  },
  {
    id: "zdjecie-do-maila",
    title: "Jak wysłać zdjęcie mailem z telefonu",
    description:
      "Dowiedz się, jak dołączyć zdjęcie do wiadomości e-mail i upewnić się, że zostało wysłane.",
    category: "kontakt",
    readTimeMinutes: 5,
    difficulty: "łatwy",
    steps: 5,
    instructions: [
      "Otwórz aplikację poczty i wybierz przycisk Nowa wiadomość.",
      "Wpisz adres odbiorcy oraz krótki temat wiadomości.",
      "Dotknij ikony spinacza lub zdjęcia i wybierz Z galerii, aby dołączyć fotografię.",
      "Po wybraniu zdjęcia poczekaj, aż miniatura pojawi się w wiadomości.",
      "Kliknij Wyślij i sprawdź folder Wysłane, aby upewnić się, że wiadomość dotarła.",
    ],
    resources: [
      {
        label: "Pomoc Gmail",
        href: "https://support.google.com/mail/answer/6584?hl=pl",
      },
    ],
  },
  {
    id: "czyszczenie-telefonu",
    title: "Porządek w telefonie: usuwanie zbędnych plików",
    description:
      "Instrukcja usuwania niepotrzebnych aplikacji i plików, aby zwolnić miejsce w telefonie.",
    category: "inne",
    readTimeMinutes: 7,
    difficulty: "łatwy",
    steps: 6,
    instructions: [
      "Sprawdź ilość wolnego miejsca w ustawieniach telefonu.",
      "Usuń aplikacje, z których nie korzystasz, przytrzymując ikonę i wybierając Usuń.",
      "Otwórz Galerię i usuń duplikaty zdjęć lub przenieś je na komputer.",
      "Wyczyść pamięć podręczną przeglądarki oraz komunikatorów (np. WhatsApp).",
      "Zainstaluj zaufaną aplikację do sprzątania, jeśli producent ją zaleca.",
      "Regularnie powtarzaj porządkowanie, np. raz w miesiącu.",
    ],
    resources: [
      {
        label: "Porady Android",
        href: "https://support.google.com/android/answer/7431795?hl=pl",
      },
    ],
  },
];
