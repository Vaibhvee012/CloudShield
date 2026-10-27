import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../services/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../services/api")>()),
  getSecurityPosture: vi.fn(),
}));

// The dashboard itself is tested separately: a stub keeps these tests about routing.
vi.mock("../pages/Dashboard", () => ({
  default: () => <div>Dashboard page stub</div>,
}));

import {
  TOKEN_KEY,
  USER_KEY,
  getSecurityPosture,
  navigation,
} from "../services/api";
import AppRoutes from "./AppRoutes";

function LocationDisplay() {
  const location = useLocation();

  return <div data-testid="path">{location.pathname}</div>;
}

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
      <LocationDisplay />
    </MemoryRouter>
  );

const signIn = () => {
  localStorage.setItem(TOKEN_KEY, "my-token");
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({ name: "Test User", role: "VIEWER" })
  );
};

beforeEach(() => {
  vi.mocked(getSecurityPosture).mockResolvedValue({
    data: { state: "NOT_CONNECTED", totalFindings: 0 },
  });
});

describe("public pages", () => {
  it("shows the landing page at /", () => {
    renderAt("/");

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /Secure your cloud/
    );
  });

  it.each([
    ["/platform", /One place to see your AWS security posture/],
    ["/security", /Built to look, not to touch/],
    ["/docs", /Getting started/],
  ])("shows the page at %s", (path, heading) => {
    renderAt(path);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      heading
    );
  });

  it("sends an unknown address to the landing page", () => {
    renderAt("/nothing-here");

    expect(screen.getByTestId("path")).toHaveTextContent(/^\/$/);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /Secure your cloud/
    );
  });

  it("shows the login and register pages without a session", () => {
    renderAt("/login");

    expect(screen.getByTestId("path")).toHaveTextContent("/login");
  });
});

describe("the signed-in area", () => {
  it.each(["/dashboard", "/resources", "/findings", "/audit-logs", "/settings"])(
    "sends a signed-out visitor from %s to the login page",
    (path) => {
      renderAt(path);

      expect(screen.getByTestId("path")).toHaveTextContent("/login");
    }
  );

  it("lets a signed-in user in and shows their details without inventing a role", () => {
    signIn();

    renderAt("/dashboard");

    expect(screen.getByTestId("path")).toHaveTextContent("/dashboard");
    expect(screen.getByText("Dashboard page stub")).toBeInTheDocument();
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("Viewer")).toBeInTheDocument();
    expect(screen.queryByText(/administrator/i)).not.toBeInTheDocument();
  });

  it("does not show a role at all when the account has none stored", () => {
    localStorage.setItem(TOKEN_KEY, "my-token");
    localStorage.setItem(USER_KEY, JSON.stringify({ name: "No Role" }));

    renderAt("/dashboard");

    expect(screen.getByText("No Role")).toBeInTheDocument();
    expect(screen.queryByText(/administrator/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Viewer")).not.toBeInTheDocument();
  });

  it("signs the user out from the header", async () => {
    const toLogin = vi.spyOn(navigation, "toLogin").mockImplementation(() => {});
    const user = userEvent.setup();

    signIn();
    renderAt("/dashboard");

    await user.click(screen.getByRole("button", { name: /sign out/i }));

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(toLogin).toHaveBeenCalledTimes(1);
  });

  it("has no fake notification bell in the header", () => {
    signIn();

    renderAt("/dashboard");

    expect(
      screen.queryByRole("button", { name: /notifications/i })
    ).not.toBeInTheDocument();
  });
});
