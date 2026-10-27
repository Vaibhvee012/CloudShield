import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import {
  ConnectionEmpty,
  PageEmpty,
  PageError,
  PageLoading,
} from "./PageState";

const inRouter = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe("PageLoading", () => {
  it("shows its label", () => {
    render(<PageLoading label="Loading findings..." />);

    expect(screen.getByText("Loading findings...")).toBeInTheDocument();
  });
});

describe("PageError", () => {
  it("shows the title and the real message", () => {
    render(
      <PageError
        title="Unable to load findings"
        message="Too many requests"
        onRetry={() => {}}
      />
    );

    expect(screen.getByText("Unable to load findings")).toBeInTheDocument();
    expect(screen.getByText("Too many requests")).toBeInTheDocument();
  });

  it("calls onRetry when Try again is clicked", async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();

    render(<PageError title="Oops" message="Broken" onRetry={onRetry} />);

    await user.click(screen.getByRole("button", { name: /try again/i }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe("PageEmpty", () => {
  it("shows a link when an action is given", () => {
    inRouter(
      <PageEmpty
        title="Nothing here"
        message="Add something."
        actionLabel="Connect AWS"
        actionTo="/connect"
      />
    );

    expect(screen.getByRole("link", { name: "Connect AWS" })).toHaveAttribute(
      "href",
      "/connect"
    );
  });

  it("shows no link when there is no action", () => {
    inRouter(<PageEmpty title="Nothing here" message="All clear." />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});

describe("ConnectionEmpty", () => {
  const renderEmpty = (connection: "NOT_CONNECTED" | "NO_DATA" | "READY" | null) =>
    inRouter(
      <ConnectionEmpty
        connection={connection}
        noun="findings"
        emptyTitle="No security findings"
        emptyMessage="Your latest scan found no issues."
      />
    );

  it("asks a new user to connect AWS", () => {
    renderEmpty("NOT_CONNECTED");

    expect(screen.getByText("No findings yet")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Connect AWS" })).toHaveAttribute(
      "href",
      "/connect"
    );
    // A new user must never be told their environment is clean.
    expect(screen.queryByText("No security findings")).not.toBeInTheDocument();
  });

  it("asks a connected user to run a first scan", () => {
    renderEmpty("NO_DATA");

    expect(screen.getByText("Waiting for your first scan")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Go to dashboard" })
    ).toHaveAttribute("href", "/dashboard");
  });

  it("shows the real empty message once data has been scanned", () => {
    renderEmpty("READY");

    expect(screen.getByText("No security findings")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("shows the neutral message while the state is unknown", () => {
    renderEmpty(null);

    expect(screen.getByText("No security findings")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
