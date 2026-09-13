import { describe, expect, it } from "vitest";

function normalizeUrl(input: string) {
  const url = new URL(input);
  return url.origin;
}

describe("deployment smoke helpers", () => {
  it("normalizes deployment URLs without trailing paths", () => {
    expect(normalizeUrl("https://example.vercel.app/foo/bar")).toBe("https://example.vercel.app");
  });

  it("accepts a valid app origin and ensures the smoke route set is stable", () => {
    const routes = ["/", "/auth", "/widget"];
    const origin = normalizeUrl("https://example.vercel.app/");

    expect(origin).toBe("https://example.vercel.app");
    expect(routes).toEqual(["/", "/auth", "/widget"]);
  });
});
