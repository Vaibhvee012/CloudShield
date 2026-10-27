import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { TOKEN_KEY, USER_KEY, navigation } from "../services/api";
import PublicNav from "./PublicNav";

const renderNav = () =>
  render(
    <MemoryRouter>
      <PublicNav />
    </MemoryRouter>
  );

describe("PublicNav", () => {
  it("links to the three public pages", () => {
    renderNav();

    expect(screen.getByRole("link", { name: "Platform" })).toHaveAttribute(
      "href",
      "/platform"
    );
    expect(screen.getByRole("link", { name: "Security" })).toHaveAttribute(
      "href",
      "/security"
    );
    expect(
      screen.getByRole("link", { name: "Documentation" })
    ).toHaveAttribute("href", "/docs");
  });

  it("offers Sign in and Get started when signed out", () => {
    renderNav();

    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/login"
    );
    expect(screen.getByRole("link", { name: /get started/i })).toHaveAttribute(
      "href",
      "/register"
    );
    expect(
      screen.queryByRole("button", { name: /sign out/i })
    ).not.toBeInTheDocument();
  });

  it("offers Dashboard and Sign out when signed in", () => {
    localStorage.setItem(TOKEN_KEY, "my-token");

    renderNav();

    expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute(
      "href",
      "/dashboard"
    );
    expect(
      screen.getByRole("button", { name: /sign out/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Sign in" })
    ).not.toBeInTheDocument();
  });

  it("signing out clears the session and goes to the login page", async () => {
    const toLogin = vi.spyOn(navigation, "toLogin").mockImplementation(() => {});
    const user = userEvent.setup();

    localStorage.setItem(TOKEN_KEY, "my-token");
    localStorage.setItem(USER_KEY, JSON.stringify({ name: "Test" }));

    renderNav();

    await user.click(screen.getByRole("button", { name: /sign out/i }));

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(USER_KEY)).toBeNull();
    expect(toLogin).toHaveBeenCalledTimes(1);
  });
});
