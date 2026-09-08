import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TajweedRecorder } from "@/components/reader/TajweedRecorder";

// Mock the hook
vi.mock("@/hooks/use-tajweed-check", () => ({
  useTajweedCheck: vi.fn(),
}));

import { useTajweedCheck } from "@/hooks/use-tajweed-check";
const mockUseTajweedCheck = vi.mocked(useTajweedCheck);

// Shared MediaRecorder mock instance
let mockMediaRecorderInstance: {
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  ondataavailable: ((e: BlobEvent) => void) | null;
  onstop: (() => void) | null;
  state: string;
};

// Mock MediaRecorder as a class
vi.stubGlobal(
  "MediaRecorder",
  class MockMediaRecorder {
    static isTypeSupported = vi.fn().mockReturnValue(true);
    state = "inactive";
    ondataavailable: ((e: BlobEvent) => void) | null = null;
    onstop: (() => void) | null = null;
    stream: MediaStream;
    constructor(stream: MediaStream, _opts?: MediaRecorderOptions) {
      this.stream = stream;
      mockMediaRecorderInstance = this as unknown as typeof mockMediaRecorderInstance;
      mockMediaRecorderInstance.start = vi.fn(() => {
        this.state = "recording";
      });
      mockMediaRecorderInstance.stop = vi.fn(() => {
        this.state = "inactive";
        if (mockMediaRecorderInstance.onstop) mockMediaRecorderInstance.onstop();
      });
    }
  }
);

// Mock getUserMedia
vi.stubGlobal("navigator", {
  ...navigator,
  mediaDevices: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }],
    }),
  },
});

describe("TajweedRecorder", () => {
  const defaultProps = {
    verseKey: "1:1",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTajweedCheck.mockReturnValue({
      isChecking: false,
      result: null,
      checkRecitation: vi.fn(),
      reset: vi.fn(),
    });
  });

  it("renders record button initially", () => {
    render(<TajweedRecorder {...defaultProps} />);
    expect(screen.getByText("Record")).toBeInTheDocument();
  });

  it("does not show check button initially", () => {
    render(<TajweedRecorder {...defaultProps} />);
    expect(screen.queryByText("Check Recitation")).not.toBeInTheDocument();
  });

  it("shows error when getUserMedia fails", async () => {
    const user = userEvent.setup();
    vi.mocked(navigator.mediaDevices.getUserMedia).mockRejectedValueOnce(
      new DOMException("NotAllowed", "NotAllowedError")
    );

    render(<TajweedRecorder {...defaultProps} />);
    await user.click(screen.getByText("Record"));

    expect(
      await screen.findByText("Microphone access denied. Please allow mic access.")
    ).toBeInTheDocument();
  });

  it("shows generic error for other getUserMedia failures", async () => {
    const user = userEvent.setup();
    vi.mocked(navigator.mediaDevices.getUserMedia).mockRejectedValueOnce(
      new Error("Device not found")
    );

    render(<TajweedRecorder {...defaultProps} />);
    await user.click(screen.getByText("Record"));

    expect(
      await screen.findByText("Could not start recording. Check your microphone.")
    ).toBeInTheDocument();
  });

  it("shows recording indicator when recording", async () => {
    const user = userEvent.setup();
    render(<TajweedRecorder {...defaultProps} />);
    await act(async () => {
      await user.click(screen.getByText("Record"));
    });

    expect(screen.getByText("Stop")).toBeInTheDocument();
    expect(screen.getByText("0:00")).toBeInTheDocument();
  });

  it("shows stop button while recording", async () => {
    const user = userEvent.setup();
    render(<TajweedRecorder {...defaultProps} />);
    await act(async () => {
      await user.click(screen.getByText("Record"));
    });

    expect(screen.getByRole("button", { name: /stop/i })).toBeInTheDocument();
  });

  it("calls onResult when result changes", () => {
    const onResult = vi.fn();
    mockUseTajweedCheck.mockReturnValue({
      isChecking: false,
      result: { transcription: "test", score: 85, issues: [] },
      checkRecitation: vi.fn(),
      reset: vi.fn(),
    });

    render(<TajweedRecorder {...defaultProps} onResult={onResult} />);
    expect(onResult).toHaveBeenCalledWith({
      transcription: "test",
      score: 85,
      issues: [],
    });
  });

  it("displays score with correct color", () => {
    mockUseTajweedCheck.mockReturnValue({
      isChecking: false,
      result: { transcription: "test", score: 95, issues: [] },
      checkRecitation: vi.fn(),
      reset: vi.fn(),
    });

    render(<TajweedRecorder {...defaultProps} />);
    expect(screen.getByText("95/100")).toBeInTheDocument();
  });

  it("displays similarity percentage", () => {
    mockUseTajweedCheck.mockReturnValue({
      isChecking: false,
      result: {
        transcription: "test",
        score: 85,
        issues: [],
        similarity: 75.5,
      },
      checkRecitation: vi.fn(),
      reset: vi.fn(),
    });

    render(<TajweedRecorder {...defaultProps} />);
    expect(screen.getByText("75.5% accuracy")).toBeInTheDocument();
  });

  it("displays transcription", () => {
    mockUseTajweedCheck.mockReturnValue({
      isChecking: false,
      result: {
        transcription: "بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ",
        score: 90,
        issues: [],
      },
      checkRecitation: vi.fn(),
      reset: vi.fn(),
    });

    render(<TajweedRecorder {...defaultProps} />);
    expect(screen.getByText("بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ")).toBeInTheDocument();
  });

  it("displays reference text", () => {
    mockUseTajweedCheck.mockReturnValue({
      isChecking: false,
      result: {
        transcription: "test",
        score: 80,
        issues: [],
        reference: "بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ",
      },
      checkRecitation: vi.fn(),
      reset: vi.fn(),
    });

    render(<TajweedRecorder {...defaultProps} />);
    expect(screen.getAllByText("بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ").length).toBeGreaterThan(0);
  });

  it("displays tajweed issues", () => {
    mockUseTajweedCheck.mockReturnValue({
      isChecking: false,
      result: {
        transcription: "test",
        score: 70,
        issues: [
          {
            rule: "Elongation (Madd)",
            severity: "warning",
            message: "Recitation too fast",
            suggestion: "Slow down",
          },
        ],
      },
      checkRecitation: vi.fn(),
      reset: vi.fn(),
    });

    render(<TajweedRecorder {...defaultProps} />);
    expect(screen.getByText("Elongation (Madd)")).toBeInTheDocument();
    expect(screen.getByText("Recitation too fast")).toBeInTheDocument();
    expect(screen.getByText("Slow down")).toBeInTheDocument();
  });

  it("shows error message on failure", () => {
    mockUseTajweedCheck.mockReturnValue({
      isChecking: false,
      result: { error: "API key not set" },
      checkRecitation: vi.fn(),
      reset: vi.fn(),
    });

    render(<TajweedRecorder {...defaultProps} />);
    expect(screen.getByText("API key not set")).toBeInTheDocument();
  });

  it("shows reset button after result", () => {
    const mockReset = vi.fn();
    mockUseTajweedCheck.mockReturnValue({
      isChecking: false,
      result: { transcription: "test", score: 80, issues: [] },
      checkRecitation: vi.fn(),
      reset: mockReset,
    });

    render(<TajweedRecorder {...defaultProps} />);
    expect(screen.getByText("Reset")).toBeInTheDocument();
  });

  it("calls reset when reset button clicked", async () => {
    const user = userEvent.setup();
    const mockReset = vi.fn();
    mockUseTajweedCheck.mockReturnValue({
      isChecking: false,
      result: { transcription: "test", score: 80, issues: [] },
      checkRecitation: vi.fn(),
      reset: mockReset,
    });

    render(<TajweedRecorder {...defaultProps} />);
    await user.click(screen.getByText("Reset"));
    expect(mockReset).toHaveBeenCalled();
  });

  it("accepts custom className", () => {
    const { container } = render(
      <TajweedRecorder {...defaultProps} className="custom-class" />
    );
    expect(container.firstElementChild).toHaveClass("custom-class");
  });

  it("applies dark mode classes for issues", () => {
    mockUseTajweedCheck.mockReturnValue({
      isChecking: false,
      result: {
        transcription: "test",
        score: 50,
        issues: [
          {
            rule: "Test",
            severity: "error",
            message: "Error message",
            suggestion: "Fix it",
          },
        ],
      },
      checkRecitation: vi.fn(),
      reset: vi.fn(),
    });

    render(<TajweedRecorder {...defaultProps} />);
    const issueCard = screen.getByText("Error message").closest("div");
    expect(issueCard).toHaveClass("bg-red-50");
  });

  it("applies correct color for warning issues", () => {
    mockUseTajweedCheck.mockReturnValue({
      isChecking: false,
      result: {
        transcription: "test",
        score: 60,
        issues: [
          {
            rule: "Test",
            severity: "warning",
            message: "Warning message",
            suggestion: "Be careful",
          },
        ],
      },
      checkRecitation: vi.fn(),
      reset: vi.fn(),
    });

    render(<TajweedRecorder {...defaultProps} />);
    const issueCard = screen.getByText("Warning message").closest("div");
    expect(issueCard).toHaveClass("bg-yellow-50");
  });
});
