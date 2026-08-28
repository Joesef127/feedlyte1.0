import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import WidgetPage from "../app/(widget)/widget/page";

describe("widget accessibility contract", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: true,
    });
  });

  it("exposes the toggle and form with accessible labels", async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(
        <WidgetPage
          searchParams={Promise.resolve({
            project: "proj_123",
            position: "bottom-right",
            url: "https://example.com",
          })}
        />,
      );
    });

    const toggle = await screen.findByRole("button", { name: /toggle feedback form/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);

    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: /feedback form/i })).toBeInTheDocument();
      expect(screen.getByRole("textbox", { name: /feedback message/i })).toBeInTheDocument();
      expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /send feedback/i })).toBeInTheDocument();
    });
  });

  it("requires a message and validates email before enabling the submit action", async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(
        <WidgetPage
          searchParams={Promise.resolve({
            project: "proj_123",
            position: "bottom-right",
            url: "https://example.com",
            rtl: "true",
          })}
        />,
      );
    });

    const root = document.querySelector("div[dir='rtl']");
    expect(root).not.toBeNull();

    const toggle = screen.getByRole("button", { name: /toggle feedback form/i });
    await user.click(toggle);

    const message = screen.getByRole("textbox", { name: /feedback message/i });
    const email = screen.getByRole("textbox", { name: /email/i });
    const submit = screen.getByRole("button", { name: /send feedback/i });

    expect(submit).toBeDisabled();

    await user.type(message, "hello");
    expect(submit).not.toBeDisabled();

    await user.clear(email);
    await user.type(email, "not-an-email");
    expect(submit).toBeDisabled();

    await user.clear(email);
    await user.type(email, "hello@example.com");
    expect(submit).not.toBeDisabled();
  });

  it("shows a clear offline retry message when the network is unavailable", async () => {
    const user = userEvent.setup();
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: false,
    });

    await act(async () => {
      render(
        <WidgetPage
          searchParams={Promise.resolve({
            project: "proj_123",
            position: "bottom-right",
            url: "https://example.com",
          })}
        />,
      );
    });

    await user.click(screen.getByRole("button", { name: /toggle feedback form/i }));
    await user.type(screen.getByRole("textbox", { name: /feedback message/i }), "Needs retry");
    await user.click(screen.getByRole("button", { name: /send feedback/i }));

    expect(screen.getByText(/offline/i)).toBeInTheDocument();
  });

  it("moves focus into the form and restores focus to the launcher when closed with Escape", async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(
        <WidgetPage
          searchParams={Promise.resolve({
            project: "proj_123",
            position: "bottom-right",
            url: "https://example.com",
          })}
        />,
      );
    });

    const toggle = screen.getByRole("button", { name: /toggle feedback form/i });
    await user.click(toggle);

    const message = screen.getByRole("textbox", { name: /feedback message/i });
    await waitFor(() => {
      expect(document.activeElement).toBe(message);
    });

    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: /feedback form/i })).not.toBeInTheDocument();
      expect(document.activeElement).toBe(toggle);
    });
  });

  it("shows a retry path when the submission is rate limited", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ error: "Too many requests. Please try again in a minute." }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await act(async () => {
      render(
        <WidgetPage
          searchParams={Promise.resolve({
            project: "proj_123",
            position: "bottom-right",
            url: "https://example.com",
          })}
        />,
      );
    });

    await user.click(screen.getByRole("button", { name: /toggle feedback form/i }));
    await user.type(screen.getByRole("textbox", { name: /feedback message/i }), "A message");
    await user.click(screen.getByRole("button", { name: /send feedback/i }));

    expect(await screen.findByText(/too many requests/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });
});
