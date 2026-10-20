import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GuestProvider } from "@/components/auth/GuestContext";
import { GuestUpgradePrompt } from "@/components/auth/GuestUpgradePrompt";

const mockPathname = vi.fn(() => "/quran");

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
}));

function renderPrompt(isGuest: boolean) {
  return render(
    <GuestProvider isGuest={isGuest}>
      <GuestUpgradePrompt />
    </GuestProvider>
  );
}

beforeEach(() => {
  sessionStorage.clear();
  mockPathname.mockReturnValue("/quran");
});

describe("GuestUpgradePrompt", () => {
  it("renders the call to action on non-dashboard routes for guests", () => {
    renderPrompt(true);
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login");
  });

  it("is absent for signed-in users", () => {
    renderPrompt(false);
    expect(document.querySelector(".amber-50")).toBeNull();
    expect(screen.queryByRole("link", { name: "Sign in" })).toBeNull();
  });

  it("stays off routes that already carry a guest explainer", () => {
    mockPathname.mockReturnValue("/");
    renderPrompt(true);
    expect(screen.queryByRole("link", { name: "Sign in" })).toBeNull();
  });

  it("dismisses for the whole browser session once 'Not now' is clicked", () => {
    renderPrompt(true);
    fireEvent.click(screen.getByRole("button", { name: "Dismiss for this session" }));
    expect(sessionStorage.getItem("guest-prompt-dismissed")).toBe("1");
    expect(screen.queryByRole("link", { name: "Sign in" })).toBeNull();
  });

  it("comes back again once the dismissal is gone (fresh session)", () => {
    renderPrompt(true);
    expect(screen.getByRole("link", { name: "Sign in" })).toBeInTheDocument();
  });
});
