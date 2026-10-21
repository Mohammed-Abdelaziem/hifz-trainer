import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Select } from "@/components/ui/select";

describe("Select", () => {
  const options = [
    { value: "1", label: "Option 1" },
    { value: "2", label: "Option 2" },
    { value: "3", label: "Option 3" },
  ];

  it("renders the selected label and all options once opened", async () => {
    const user = userEvent.setup();
    render(<Select defaultValue="2" options={options} />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("Option 2");
    await user.click(trigger);
    const listbox = screen.getByRole("listbox");
    expect(within(listbox).getByText("Option 1")).toBeInTheDocument();
    expect(within(listbox).getByText("Option 2")).toBeInTheDocument();
    expect(
      within(listbox).getByRole("option", { name: "Option 2" })
    ).toHaveAttribute("aria-selected", "true");
  });

  it("fires onChange with the option value when a row is picked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Select onChange={onChange} options={options} />);
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Option 2" }));
    expect(onChange).toHaveBeenCalledWith({ target: { value: "2" } });
    // The menu closes after a pick.
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("supports keyboard navigation and selection", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Select onChange={onChange} options={options} />);
    const trigger = screen.getByRole("combobox");
    await user.click(trigger);
    await user.keyboard("{ArrowDown}");
    expect(trigger.getAttribute("aria-activedescendant")).toBeTruthy();
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith({ target: { value: "2" } });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("Escape closes the menu without selecting", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Select onChange={onChange} options={options} />);
    await user.click(screen.getByRole("combobox"));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders a chevron indicator", () => {
    const { container } = render(<Select options={options} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("can be disabled and does not open", async () => {
    const user = userEvent.setup();
    render(<Select disabled options={options} />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toBeDisabled();
    await user.click(trigger);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("applies custom className to the trigger", () => {
    const { container } = render(
      <Select className="w-48" options={[{ value: "1", label: "Test" }]} />
    );
    expect(container.firstChild).toHaveClass("inline-flex");
    expect(screen.getByRole("combobox")).toHaveClass("w-48");
  });
});
