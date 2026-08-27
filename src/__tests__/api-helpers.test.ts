import { describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));

import { API_ERROR_CODES, ApiError, err, handleError } from "@/lib/api-helpers";

describe("API response helpers", () => {
  it("returns a stable error code with an error response", async () => {
    const response = err("No access", 403, undefined, API_ERROR_CODES.FORBIDDEN);

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: "No access",
      code: "FORBIDDEN",
    });
  });

  it("preserves structured API error codes", async () => {
    const response = handleError(
      new ApiError("Unauthorized", 401, API_ERROR_CODES.UNAUTHORIZED),
      "test",
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Unauthorized",
      code: "UNAUTHORIZED",
    });
  });
});