export type ReportGroupKey =
  | "digital"
  | "security"
  | "communication"
  | "finance"
  | "other";

export interface ReportGroupMeta {
  key: ReportGroupKey;
  label: string;
  description: string;
  color: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  typeIds: number[];
}

const GROUP_DEFINITIONS: ReportGroupMeta[] = [
  {
    key: "digital",
    label: "Wsparcie cyfrowe",
    description: "Problemy z aplikacjami i usługami online",
    color: "primary",
    typeIds: [1],
  },
  {
    key: "security",
    label: "Bezpieczeństwo",
    description: "Ochrona danych i zgłoszenia bezpieczeństwa",
    color: "danger",
    typeIds: [2],
  },
  {
    key: "communication",
    label: "Łączność",
    description: "Kontakt, połączenia i komunikacja",
    color: "secondary",
    typeIds: [3],
  },
  {
    key: "finance",
    label: "Finanse",
    description: "Płatności, bankowość i kwestie finansowe",
    color: "warning",
    typeIds: [4],
  },
  {
    key: "other",
    label: "Inne wsparcie",
    description: "Pozostałe zgłoszenia",
    color: "success",
    typeIds: [5],
  },
];

const GROUPS_BY_TYPE = GROUP_DEFINITIONS.reduce<Record<number, ReportGroupMeta>>(
  (memo, group) => {
    group.typeIds.forEach((typeId) => {
      memo[typeId] = group;
    });
    return memo;
  },
  {},
);

export const getReportGroupMeta = (typeId?: number | null) => {
  if (typeId === null || typeId === undefined) {
    return undefined;
  }

  return GROUPS_BY_TYPE[typeId];
};

export const getReportGroupLabel = (typeId?: number | null) =>
  getReportGroupMeta(typeId)?.label ?? "Inne zgłoszenia";

export const listReportGroups = () => GROUP_DEFINITIONS.slice();
