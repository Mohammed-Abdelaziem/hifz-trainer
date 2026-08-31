import { describe, expect, it } from "vitest";
import { useOnboardingStore } from "@/stores/onboarding-store";

describe("onboarding-store", () => {
  it("defaults to not completed", () => {
    useOnboardingStore.setState({ hasCompletedOnboarding: false });
    expect(useOnboardingStore.getState().hasCompletedOnboarding).toBe(false);
  });

  it("completeOnboarding sets to true", () => {
    useOnboardingStore.setState({ hasCompletedOnboarding: false });
    useOnboardingStore.getState().completeOnboarding();
    expect(useOnboardingStore.getState().hasCompletedOnboarding).toBe(true);
  });

  it("resetOnboarding sets to false", () => {
    useOnboardingStore.setState({ hasCompletedOnboarding: true });
    useOnboardingStore.getState().resetOnboarding();
    expect(useOnboardingStore.getState().hasCompletedOnboarding).toBe(false);
  });
});
