import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { GuestProvider, useIsGuest } from "@/components/auth/GuestContext";

function TestConsumer() {
  const isGuest = useIsGuest();
  return <span>{isGuest ? "guest" : "authed"}</span>;
}

describe("GuestContext", () => {
  it("defaults to false (not guest)", () => {
    render(
      <GuestProvider isGuest={false}>
        <TestConsumer />
      </GuestProvider>
    );
    expect(screen.getByText("authed")).toBeInTheDocument();
  });

  it("provides true when isGuest=true", () => {
    render(
      <GuestProvider isGuest={true}>
        <TestConsumer />
      </GuestProvider>
    );
    expect(screen.getByText("guest")).toBeInTheDocument();
  });

  it("provides false when isGuest=false", () => {
    render(
      <GuestProvider isGuest={false}>
        <TestConsumer />
      </GuestProvider>
    );
    expect(screen.getByText("authed")).toBeInTheDocument();
  });
});
