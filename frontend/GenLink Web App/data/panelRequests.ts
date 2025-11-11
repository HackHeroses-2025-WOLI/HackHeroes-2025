export type PanelRequestCategory = "zdrowie" | "platnosci" | "polaczenia" | "bezpieczenstwo" | "inne";
export type PanelRequestStatus = "active" | "pending" | "contact";

export const panelCategoryLabels: Record<PanelRequestCategory, string> = {
  zdrowie: "IKP / e-zdrowie",
  platnosci: "Płatności",
  polaczenia: "Połączenia",
  bezpieczenstwo: "Bezpieczeństwo",
  inne: "Inne",
};

export interface PanelRequest {
  id: string;
  senior: string;
  age: number;
  city: string;
  category: PanelRequestCategory;
  summary: string;
  description: string;
  submittedAgo: string;
  phone: string;
  preferredContact: string;
  address?: string;
  checklist: string[];
  status: PanelRequestStatus;
}

export const panelRequests: PanelRequest[] = [
  {
    id: "henryk-whatsapp",
    senior: "Pan Henryk",
    age: 81,
    city: "Wrocław",
    category: "polaczenia",
    summary: "WhatsApp – brak dźwięku podczas rozmowy",
    description:
      "Senior nie słyszy rozmówcy po odebraniu połączenia. Prosi o wspólne sprawdzenie ustawień głośności i uprawnień aplikacji.",
    submittedAgo: "przed chwilą",
    phone: "+48 600 123 456",
    preferredContact: "Dziś po 16:30 (po zakończeniu rehabilitacji)",
    checklist: [
      "Sprawdź, czy głośność w telefonie jest ustawiona na maksimum.",
      "Zweryfikuj uprawnienia WhatsApp do korzystania z mikrofonu i głośnika.",
      "Przeprowadź próbne połączenie i poproś o informację zwrotną od seniora.",
    ],
    status: "active",
  },
  {
    id: "barbara-epacjent",
    senior: "Pani Barbara",
    age: 78,
    city: "Poznań",
    category: "zdrowie",
    summary: "Dodanie osoby zaufanej w IKP",
    description:
      "Seniorce potrzebna jest pomoc przy dodaniu córki do odbioru e-recept oraz włączeniu powiadomień SMS.",
    submittedAgo: "5 min temu",
    phone: "+48 601 222 655",
    preferredContact: "Dowolnie między 10:00 a 12:00",
    checklist: [
      "Wyjaśnij, jak zalogować się do Internetowego Konta Pacjenta.",
      "Przeprowadź dodanie osoby zaufanej i ustawienie powiadomień.",
      "Sprawdź, czy senior potrafi wydrukować potwierdzenie.",
    ],
    status: "pending",
  },
  {
    id: "jadwiga-blik",
    senior: "Pani Jadwiga",
    age: 74,
    city: "Warszawa",
    category: "platnosci",
    summary: "Płatność BLIK – prośba o przećwiczenie",
    description:
      "Seniorce zależy na przećwiczeniu płatności BLIK przed ważną transakcją bankową.",
    submittedAgo: "12 min temu",
    phone: "+48 609 778 900",
    preferredContact: "Dziś po 18:00",
    checklist: [
      "Omów zasady bezpiecznego logowania do banku.",
      "Przećwicz wygenerowanie kodu BLIK i autoryzację.",
      "Zaznacz, by nie ujawniać kodu osobom trzecim.",
    ],
    status: "pending",
  },
  {
    id: "zbigniew-sms",
    senior: "Pan Zbigniew",
    age: 76,
    city: "Łódź",
    category: "bezpieczenstwo",
    summary: "Podejrzane wiadomości SMS",
    description:
      "Senior otrzymał wiadomość o dopłacie do przesyłki i chce upewnić się, czy to bezpieczne.",
    submittedAgo: "18 min temu",
    phone: "+48 500 430 220",
    preferredContact: "Najlepiej teraz",
    checklist: [
      "Poproś o odczytanie treści SMS i sprawdź adres URL.",
      "Wyjaśnij zasady rozpoznawania phishingu i zablokuj numer.",
      "Zaproponuj instalację aplikacji ostrzegającej o oszustwach.",
    ],
    status: "pending",
  },
  {
    id: "helena-formularz",
    senior: "Pani Helena",
    age: 83,
    city: "Gdańsk",
    category: "inne",
    summary: "Formularz bez szczegółów – prośba o telefon",
    description:
      "Zgłoszenie trafiło z formularza \"Potrzebuję pomocy\". Brak opisu problemu, należy zadzwonić i ustalić potrzeby.",
    submittedAgo: "25 min temu",
    phone: "+48 602 410 880",
    preferredContact: "Dowolnie dziś do 20:00",
    checklist: [
      "Przedstaw się i wyjaśnij, że oddzwaniasz w sprawie prośby o pomoc.",
      "Zanotuj, jaki problem zgłasza senior i czy to pilne.",
      "Ustal dogodny termin właściwego wsparcia z innym wolontariuszem.",
    ],
    status: "contact",
  },
  {
    id: "janina-automat",
    senior: "Pani Janina",
    age: 79,
    city: "Katowice",
    category: "platnosci",
    summary: "Zgłoszenie automatyczne – doprecyzuj temat",
    description:
      "System wykrył prośbę o wsparcie finansowe, ale treść jest zbyt ogólna. Potrzebny telefon i zebranie szczegółów.",
    submittedAgo: "32 min temu",
    phone: "+48 530 990 220",
    preferredContact: "Najlepiej przed 14:00",
    checklist: [
      "Sprawdź, czy senior próbował wykonać przelew lub płatność.",
      "Zapytaj o poczucie bezpieczeństwa i potencjalne oszustwo.",
      "Umów właściwe wsparcie lub przekieruj do dyżuru specjalisty.",
    ],
    status: "contact",
  },
];

export const panelActiveRequest = panelRequests.find((request) => request.status === "active") ?? null;

export const panelPendingRequests = panelRequests.filter((request) => request.status === "pending");

export const panelContactRequests = panelRequests.filter((request) => request.status === "contact");

export const findPanelRequestById = (id: string) => panelRequests.find((request) => request.id === id);
