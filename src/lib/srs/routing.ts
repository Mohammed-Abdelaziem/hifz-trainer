import type { Grade, MemoryState } from "@/types/quran";

export function applyHifzRouting(
  prevState: MemoryState,
  grade: Grade,
  intervalDays: number
): MemoryState {
  let state = prevState;
  if (grade === "AGAIN") {
    // A KNOWN verse that fails a spot-check weakens just like MANZIL.
    if (prevState === "MANZIL" || prevState === "KNOWN") state = "SABQI";
  } else {
    if (prevState === "SABAQ") state = "SABQI";
    else if (prevState === "SABQI" && intervalDays >= 21) state = "MANZIL";
    // KNOWN stays KNOWN on any passing grade: marking is deliberate, a
    // friendly spot-check should not silently demote it to the active
    // rotation. Only AGAIN (above) pulls it back into Sabqi.
  }
  return state;
}
