import type { Grade, MemoryState } from "@/types/quran";

export function applyHifzRouting(
  prevState: MemoryState,
  grade: Grade,
  intervalDays: number
): MemoryState {
  let state = prevState;
  if (grade === "AGAIN") {
    if (prevState === "MANZIL") state = "SABQI";
  } else {
    if (prevState === "SABAQ") state = "SABQI";
    else if (prevState === "SABQI" && intervalDays >= 21) state = "MANZIL";
  }
  return state;
}
