export interface ReciterOption {
  id: number;
  name: string;
}

export const RECITERS: ReciterOption[] = [
  { id: 7, name: "Mishary Alafasy" },
  { id: 6, name: "Mahmoud Al-Husary" },
  { id: 12, name: "Al-Husary (Muallim)" },
  { id: 2, name: "AbdulBaset (Murattal)" },
  { id: 1, name: "AbdulBaset (Mujawwad)" },
  { id: 3, name: "Abdur-Rahman as-Sudais" },
  { id: 9, name: "Al-Minshawi (Murattal)" },
  { id: 4, name: "Abu Bakr al-Shatri" },
  { id: 5, name: "Hani ar-Rifai" },
  { id: 10, name: "Sa`ud ash-Shuraym" },
];

export const DEFAULT_RECITER_ID = 7;

export const VALID_RECITER_IDS = new Set(RECITERS.map((r) => r.id));
