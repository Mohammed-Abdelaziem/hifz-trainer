import { describe, expect, it, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { useOnboardingStore } from "@/stores/onboarding-store";

describe("OnboardingTour", () => {
  beforeEach(() => {
    localStorage.clear();
    useOnboardingStore.setState({ hasCompletedOnboarding: false });
  });

  it("renders when onboarding is not completed", () => {
    render(<OnboardingTour />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Welcome to Hifz Trainer")).toBeInTheDocument();
  });

  it("does not render when onboarding is completed", () => {
    useOnboardingStore.setState({ hasCompletedOnboarding: true });
    render(<OnboardingTour />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows first step title", () => {
    render(<OnboardingTour />);
    expect(screen.getByText("Welcome to Hifz Trainer")).toBeInTheDocument();
  });

  it("navigates to next step", async () => {
    const user = userEvent.setup();
    render(<OnboardingTour />);
    await user.click(screen.getByText("Next"));
    await waitFor(() => {
      expect(screen.getByText("Read & Listen")).toBeInTheDocument();
    });
  });

  it("navigates through all steps", async () => {
    const user = userEvent.setup();
    render(<OnboardingTour />);

    await user.click(screen.getByText("Next"));
    await waitFor(() => expect(screen.getByText("Read & Listen")).toBeInTheDocument());

    await user.click(screen.getByText("Next"));
    await waitFor(() => expect(screen.getByText("Memorize with Spaced Repetition")).toBeInTheDocument());

    await user.click(screen.getByText("Next"));
    await waitFor(() => expect(screen.getByText("Track Your Progress")).toBeInTheDocument());

    await user.click(screen.getByText("Next"));
    await waitFor(() => expect(screen.getByText("You're All Set!")).toBeInTheDocument());
  });

  it("shows 'Get Started' on last step", async () => {
    const user = userEvent.setup();
    render(<OnboardingTour />);

    for (let i = 0; i < 4; i++) {
      await user.click(screen.getByText("Next"));
      await waitFor(() => {});
    }
    expect(screen.getByText("Get Started")).toBeInTheDocument();
  });

  it("completes onboarding on last step click", async () => {
    const user = userEvent.setup();
    render(<OnboardingTour />);

    for (let i = 0; i < 4; i++) {
      await user.click(screen.getByText("Next"));
      await waitFor(() => {});
    }
    await user.click(screen.getByText("Get Started"));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(useOnboardingStore.getState().hasCompletedOnboarding).toBe(true);
  });

  it("skip button completes onboarding", async () => {
    const user = userEvent.setup();
    render(<OnboardingTour />);
    await user.click(screen.getByLabelText("Skip onboarding"));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(useOnboardingStore.getState().hasCompletedOnboarding).toBe(true);
  });

  it("previous button is disabled on first step", () => {
    render(<OnboardingTour />);
    const prevBtn = screen.getByText("Previous");
    expect(prevBtn).toBeDisabled();
  });

  it("navigates back", async () => {
    const user = userEvent.setup();
    render(<OnboardingTour />);
    await user.click(screen.getByText("Next"));
    await waitFor(() => expect(screen.getByText("Read & Listen")).toBeInTheDocument());
    await user.click(screen.getByText("Previous"));
    await waitFor(() => expect(screen.getByText("Welcome to Hifz Trainer")).toBeInTheDocument());
  });

  it("shows progress dots", () => {
    const { container } = render(<OnboardingTour />);
    const dots = container.querySelectorAll("[class*='rounded-full'][class*='transition-all']");
    expect(dots.length).toBe(5);
  });
});
