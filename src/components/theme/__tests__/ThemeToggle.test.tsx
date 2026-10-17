import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useThemeStore } from "@/stores/theme-store";

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    useThemeStore.setState({ theme: "system" });
  });

  it("labels the current theme and what one click switches to", async () => {
    render(<ThemeToggle />);
    // Default store state is "system": light until the OS says otherwise.
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Theme: System. Switch to Light." })).toBeInTheDocument()
    );
  });

  it("cycles system → light → dark and writes the same storage the boot script reads", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    const toggle = () => screen.getByRole("button", { name: /Theme: / });

    await user.click(toggle()); // system -> light
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Theme: Light. Switch to Dark." })).toBeInTheDocument()
    );
    await user.click(toggle()); // light -> dark
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Theme: Dark. Switch to System." })).toBeInTheDocument()
    );

    expect(JSON.parse(localStorage.getItem("theme") ?? "{}").state.theme).toBe("dark");
  });

  it("shows the stored theme once the persisted store rehydrates", async () => {
    localStorage.setItem("theme", JSON.stringify({ state: { theme: "dark" }, version: 0 }));
    render(<ThemeToggle />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Theme: Dark. Switch to System." })).toBeInTheDocument()
    );
  });
});
