import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/feedback/bulk/route";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    feedback: {
      findMany: vi.fn(),
      updateMany: vi.fn(),
      deleteMany: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn((promises) => Promise.all(promises)),
  },
}));

const mockAuth = auth as ReturnType<typeof vi.fn>;
const mockPrisma = prisma as unknown as {
  feedback: {
    findMany: ReturnType<typeof vi.fn>;
    updateMany: ReturnType<typeof vi.fn>;
    deleteMany: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  user: {
    findUnique: ReturnType<typeof vi.fn>;
  };
  $transaction: ReturnType<typeof vi.fn>;
};

describe("POST /api/feedback/bulk", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 if unauthenticated", async () => {
    mockAuth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost/api/feedback/bulk", {
      method: "POST",
      body: JSON.stringify({
        action: "status",
        feedbackIds: ["fb_1"],
        status: "resolved",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid action payload", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "usr_1" } });

    const req = new Request("http://localhost/api/feedback/bulk", {
      method: "POST",
      body: JSON.stringify({
        action: "invalid_action",
        feedbackIds: [],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 404 if none of the targeted feedback items belong to the user", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "usr_1" } });
    mockPrisma.feedback.findMany.mockResolvedValueOnce([]);

    const req = new Request("http://localhost/api/feedback/bulk", {
      method: "POST",
      body: JSON.stringify({
        action: "status",
        feedbackIds: ["fb_other_1"],
        status: "in_review",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it("performs bulk status update and updates resolvedAt timestamp", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "usr_1" } });
    mockPrisma.feedback.findMany.mockResolvedValueOnce([
      { id: "fb_1", tags: [] },
      { id: "fb_2", tags: [] },
    ]);
    mockPrisma.feedback.updateMany.mockResolvedValueOnce({ count: 2 });

    const req = new Request("http://localhost/api/feedback/bulk", {
      method: "POST",
      body: JSON.stringify({
        action: "status",
        feedbackIds: ["fb_1", "fb_2"],
        status: "resolved",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.count).toBe(2);
    expect(data.action).toBe("status");

    expect(mockPrisma.feedback.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ["fb_1", "fb_2"] } },
      data: {
        status: "resolved",
        resolvedAt: expect.any(Date),
      },
    });
  });

  it("performs bulk delete", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "usr_1" } });
    mockPrisma.feedback.findMany.mockResolvedValueOnce([
      { id: "fb_1", tags: [] },
    ]);
    mockPrisma.feedback.deleteMany.mockResolvedValueOnce({ count: 1 });

    const req = new Request("http://localhost/api/feedback/bulk", {
      method: "POST",
      body: JSON.stringify({
        action: "delete",
        feedbackIds: ["fb_1"],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.count).toBe(1);
    expect(mockPrisma.feedback.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ["fb_1"] } },
    });
  });

  it("performs bulk tagging with add operation", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "usr_1" } });
    mockPrisma.feedback.findMany.mockResolvedValueOnce([
      { id: "fb_1", tags: ["existing"] },
    ]);
    mockPrisma.feedback.update.mockResolvedValueOnce({ id: "fb_1", tags: ["existing", "v1.0"] });

    const req = new Request("http://localhost/api/feedback/bulk", {
      method: "POST",
      body: JSON.stringify({
        action: "tag",
        feedbackIds: ["fb_1"],
        tags: ["v1.0"],
        operation: "add",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(mockPrisma.feedback.update).toHaveBeenCalledWith({
      where: { id: "fb_1" },
      data: { tags: ["existing", "v1.0"] },
    });
  });

  it("performs bulk assignment", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "usr_1" } });
    mockPrisma.feedback.findMany.mockResolvedValueOnce([{ id: "fb_1" }]);
    mockPrisma.user.findUnique.mockResolvedValueOnce({ id: "usr_member" });
    mockPrisma.feedback.updateMany.mockResolvedValueOnce({ count: 1 });

    const req = new Request("http://localhost/api/feedback/bulk", {
      method: "POST",
      body: JSON.stringify({
        action: "assign",
        feedbackIds: ["fb_1"],
        assigneeId: "usr_member",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    expect(mockPrisma.feedback.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ["fb_1"] } },
      data: { assignedToId: "usr_member" },
    });
  });
});
