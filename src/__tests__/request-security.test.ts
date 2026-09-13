import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

describe("API same-origin protection", () => {
  it("rejects a cross-origin authenticated mutation", () => {
    const response = proxy(
      new NextRequest("https://app.feedlyte.test/api/projects", {
        method: "POST",
        headers: { Origin: "https://attacker.example" },
      }),
    );

    expect(response.status).toBe(403);
  });

  it("allows a same-origin authenticated mutation", () => {
    const response = proxy(
      new NextRequest("https://app.feedlyte.test/api/projects", {
        method: "POST",
        headers: { Origin: "https://app.feedlyte.test" },
      }),
    );

    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(response.headers.get("x-request-id")).toBeTruthy();
  });

  it("preserves public feedback submission for its dedicated origin policy", () => {
    const response = proxy(
      new NextRequest("https://app.feedlyte.test/api/feedback", {
        method: "POST",
        headers: { Origin: "https://customer.example" },
      }),
    );

    expect(response.headers.get("x-middleware-next")).toBe("1");
  });
});
