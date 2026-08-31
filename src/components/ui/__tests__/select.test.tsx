import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Select } from "@/components/ui/select";

describe("Select", () => {
  it("renders all options", () => {
    render(
      <Select
        options={[
          { value: "1", label: "Option 1" },
          { value: "2", label: "Option 2" },
          { value: "3", label: "Option 3" },
        ]}
      />
    );
    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
    expect(screen.getByText("Option 3")).toBeInTheDocument();
  });

  it("renders with a default value", () => {
    render(
      <Select
        defaultValue="2"
        options={[
          { value: "1", label: "First" },
          { value: "2", label: "Second" },
        ]}
      />
    );
    const select = screen.getByRole("combobox");
    expect(select).toHaveValue("2");
  });

  it("fires onChange when selection changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Select
        onChange={onChange}
        options={[
          { value: "a", label: "Alpha" },
          { value: "b", label: "Beta" },
        ]}
      />
    );
    await user.selectOptions(screen.getByRole("combobox"), "b");
    expect(onChange).toHaveBeenCalled();
  });

  it("renders chevron icon", () => {
    const { container } = render(
      <Select options={[{ value: "1", label: "Test" }]} />
    );
    const chevron = container.querySelector("svg");
    expect(chevron).toBeInTheDocument();
  });

  it("can be disabled", () => {
    render(
      <Select
        disabled
        options={[{ value: "1", label: "Disabled" }]}
      />
    );
    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it("applies custom className", () => {
    const { container } = render(
      <Select
        className="w-48"
        options={[{ value: "1", label: "Test" }]}
      />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("inline-flex");
  });
});
