import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AudioSyncProvider } from "@/hooks/use-audio-sync";
import { AudioEngine } from "@/lib/audio/engine";
import { MaskingToolbar } from "@/components/reader/MaskingToolbar";
import { VerseCanvas } from "@/components/reader/VerseCanvas";
import { useReaderStore } from "@/stores/reader-store";
import { FIXTURE_SURAHS } from "@/lib/quran/fixtures";

function withProvider(ui: React.ReactElement) {
  const engine = new AudioEngine();
  return <AudioSyncProvider engine={engine}>{ui}</AudioSyncProvider>;
}

describe("VerseCanvas — full-verse English translation", () => {
  beforeEach(() => {
    useReaderStore.setState(
      {
        maskMode: "FULL",
        showVerseTranslation: false,
        showRoots: false,
      },
      false
    );
  });

  it("hides the English line by default", () => {
    render(withProvider(<VerseCanvas surah={FIXTURE_SURAHS[1]} />));
    expect(screen.queryByTestId("verse-translation")).toBeNull();
  });

  it("shows the English line under each verse once toggled", async () => {
    useReaderStore.setState({ showVerseTranslation: true }, false);
    render(withProvider(<VerseCanvas surah={FIXTURE_SURAHS[1]} />));
    const lines = screen.getAllByTestId("verse-translation");
    expect(lines.length).toBe(FIXTURE_SURAHS[1].ayahs.length);
    expect(lines[0]).toHaveTextContent(
      "In the name of Allah, the Entirely Merciful, the Especially Merciful."
    );
  });

  it("toggles from the MaskingToolbar chip", async () => {
    const user = userEvent.setup();
    render(
      withProvider(
        <>
          <MaskingToolbar />
          <VerseCanvas surah={FIXTURE_SURAHS[112]} />
        </>
      )
    );
    await user.click(screen.getByRole("button", { name: "Verse translation" }));
    expect(screen.getAllByTestId("verse-translation")[0]).toHaveTextContent(
      "Say, \"He is Allah, [who is] One,"
    );
    await user.click(screen.getByRole("button", { name: "Verse translation" }));
    expect(screen.queryByTestId("verse-translation")).toBeNull();
  });
});
