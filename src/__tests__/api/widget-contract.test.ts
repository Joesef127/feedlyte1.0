import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    project: { findUnique: vi.fn() },
    feedback: { findMany: vi.fn() },
  },
}));

import { GET as getFeedback } from "@/app/api/feedback/route";
import { GET as getWidgetConfig } from "@/app/api/widget-config/route";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

const mockPrisma = prisma as unknown as {
  project: { findUnique: ReturnType<typeof vi.fn> };
  feedback: { findMany: ReturnType<typeof vi.fn> };
};

const mockAuth = auth as ReturnType<typeof vi.fn>;

describe("API contract compatibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the versioned widget config contract", async () => {
    mockPrisma.project.findUnique.mockResolvedValue({
      id: "proj_1",
      color: "#F59E0B",
      position: "bottom-right",
      label: "Feedback",
      allowedOrigin: "https://app.example.com",
    });

    const response = await getWidgetConfig(new Request("http://localhost/api/widget-config?project=proj_1"));

    expect(response.status).toBe(200);
    expect(response.headers.get("X-Feedlyte-Widget-Version")).toBe("v1");

    const json = await response.json();
    expect(json).toMatchObject({
      version: "v1",
      color: "#F59E0B",
      position: "bottom-right",
      label: "Feedback",
      allowedOrigin: "https://app.example.com",
    });
  });

  it("sanitizes invalid public widget configuration", async () => {
    mockPrisma.project.findUnique.mockResolvedValue({
      color: "javascript:alert(1)",
      position: "overlay",
      label: "",
      allowedOrigin: null,
    });

    const response = await getWidgetConfig(new Request("http://localhost/api/widget-config?project=proj_1"));
    const json = await response.json();

    expect(json).toMatchObject({
      color: "#F59E0B",
      position: "bottom-right",
      label: "Feedback",
    });
  });

  it("returns the versioned feedback list contract with pagination metadata", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.feedback.findMany.mockResolvedValue([
      {
        id: "fb_1",
        projectId: "proj_1",
        message: "Alpha",
        email: "test@example.com",
        pageUrl: "https://example.com",
        userAgent: "Mozilla/5.0",
        status: "unreviewed",
        createdAt: new Date("2024-01-15T10:00:00.000Z"),
      },
      {
        id: "fb_2",
        projectId: "proj_1",
        message: "Beta",
        email: "other@example.com",
        pageUrl: "https://example.com/foo",
        userAgent: "Mozilla/5.0",
        status: "resolved",
        createdAt: new Date("2024-01-14T10:00:00.000Z"),
      },
    ]);

    const response = await getFeedback(new Request("http://localhost/api/feedback?limit=2"));

    expect(response.status).toBe(200);
    expect(response.headers.get("X-Feedlyte-API-Version")).toBe("v1");
    expect(response.headers.get("x-next-cursor")).toBe("fb_2");

    const json = await response.json();
    expect(json).toHaveLength(2);
    expect(json[0]).toMatchObject({ id: "fb_1", projectId: "proj_1" });
  });
});