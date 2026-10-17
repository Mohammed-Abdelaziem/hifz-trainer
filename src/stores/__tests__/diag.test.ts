import { create } from "zustand";
import { persist } from "zustand/middleware";
import { it, vi, expect } from "vitest";
import { useReaderStore } from "../reader-store";

type MinState = { flag: boolean };

const useMin = create<MinState>()(
  persist<MinState, [], [], Pick<MinState, "flag">>(
    () => ({ flag: false }),
    {
      name: "min-diag",
      skipHydration: true,
      partialize: (s) => ({ flag: s.flag }),
    }
  )
);

it("diag: persisted true restored over in-memory false", async () => {
  const errors: unknown[] = [];
  const errSpy = vi.spyOn(console, "error").mockImplementation((e) => {
    errors.push(e);
  });

  useMin.setState({ flag: true });
  console.log("MIN-LS:", localStorage.getItem("min-diag"));
  useMin.setState({ flag: false });
  const r1 = useMin.persist.rehydrate();
  try {
    await r1;
  } catch (e) {
    console.log("MIN-REHYDRATE-THREW:", e);
  }
  console.log("MIN-after-rehydrate:", useMin.getState().flag);
  console.log("MIN-errors:", errors);

  useReaderStore.getState().toggleVerseTranslation();
  console.log("READER-LS:", localStorage.getItem("reader-settings"));
  useReaderStore.setState({ showVerseTranslation: false }, false);
  console.log("READER-pre-state:", useReaderStore.getState().showVerseTranslation);
  const r2 = useReaderStore.persist.rehydrate();
  try {
    await r2;
  } catch (e) {
    console.log("READER-REHYDRATE-THREW:", e);
  }
  console.log("READER-after-rehydrate:", useReaderStore.getState().showVerseTranslation);
  console.log("READER-errors:", errors);
  console.log("READER-hasHydrated:", useReaderStore.persist.hasHydrated());

  expect(true).toBe(true);
  errSpy.mockRestore();
});

