import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { QuranWord } from "@/types/quran";
import { VerseWord } from "@/components/reader/VerseWord";

const word: QuranWord = {
  id: "112:1:1",
  text_uthmani: "قُلْ",
  translation: "Say",
};

type Props = Parameters<typeof VerseWord>[0];

function baseProps(mode: Props["mode"], revealed = false): Props {
  return {
    word,
    mode,
    revealed,
    active: false,
    showTranslation: false,
    showRoots: false,
    onReveal: vi.fn(),
  };
}

describe("VerseWord masking", () => {
  it("shows full text in FULL mode and never triggers reveal", async () => {
    const onReveal = vi.fn();
    render(<VerseWord {...baseProps("FULL")} onReveal={onReveal} />);
    expect(screen.getByText("قُلْ")).toBeInTheDocument();
    const user = userEvent.setup();
    await user.click(screen.getByText("قُلْ"));
    expect(onReveal).not.toHaveBeenCalled();
  });

  it("blurs until revealed, then reveals permanently", async () => {
    const view = render(<VerseWord {...baseProps("BLUR")} />);
    const wrapper = screen.getByText(word.text_uthmani).parentElement;
    expect(wrapper?.className).toContain("blur-");

    view.rerender(<VerseWord {...baseProps("BLUR", true)} />);
    expect(screen.getByText(word.text_uthmani).parentElement?.className).not.toContain(
      "blur-"
    );
  });

  it("renders a first-letter prompt in FIRST_LETTER mode", () => {
    render(<VerseWord {...baseProps("FIRST_LETTER")} />);
    expect(screen.getByText(/قـ/)).toBeInTheDocument();
    expect(screen.queryByText("قُلْ")).toBeNull();
  });

  it("hides text but keeps layout in REVEAL mode and reveals on click", async () => {
    const onReveal = vi.fn();
    render(<VerseWord {...baseProps("REVEAL")} onReveal={onReveal} />);
    const wrapper = screen.getByText("قُلْ").parentElement;
    expect(wrapper?.className).toContain("text-transparent");

    const user = userEvent.setup();
    await user.click(screen.getByText("قُلْ"));
    expect(onReveal).toHaveBeenCalledTimes(1);
  });
});
