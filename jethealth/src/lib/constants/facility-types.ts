export const FACILITY_TYPES = {
  ASL: "001",
  CONSULTORI: "002",
  FARMACIE: "003",
  PRONTO_SOCCORSO: "006",
  RICOVERO: "007",
  VISITE_ESAMI: "008",
  STUDIO_MEDICO: "009",
} as const;

export const FACILITY_TYPE_LABELS: Record<string, string> = {
  "001": "ASL",
  "002": "Consultorio",
  "003": "Farmacia",
  "006": "Pronto Soccorso",
  "007": "Ospedale / Ricovero",
  "008": "Visite ed esami",
  "009": "Studio medico",
};

export const FACILITY_TYPE_COLORS: Record<string, string> = {
  "001": "#0B5FA5",
  "002": "#7C3AED",
  "003": "#16A34A",
  "006": "#DC2626",
  "007": "#C2410C",
  "008": "#0891B2",
  "009": "#2563EB",
};
