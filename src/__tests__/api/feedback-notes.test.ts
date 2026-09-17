import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/feedback/[id]/notes/route";
import { DELETE } from "@/app/api/feedback/[id]/notes/[noteId]/route";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    feedback: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    feedbackNote: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
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
    findFirst: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  feedbackNote: {
    findMany: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  user: {
    findUnique: ReturnType<typeof vi.fn>;
  };
};

describe("Feedback Notes API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/feedback/[id]/notes", () => {
    it("returns 401 when unauthorized", async () => {
      mockAuth.mockResolvedValueOnce(null);

      const req = new Request("http://localhost/api/feedback/fb_1/notes");
      const res = await GET(req, { params: Promise.resolve({ id: "fb_1" }) });

      expect(res.status).toBe(401);
    });

    it("returns 404 when feedback does not exist or user lacks access", async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: "usr_1" } });
      mockPrisma.feedback.findFirst.mockResolvedValueOnce(null);

      const req = new Request("http://localhost/api/feedback/fb_1/notes");
      const res = await GET(req, { params: Promise.resolve({ id: "fb_1" }) });

      expect(res.status).toBe(404);
    });

    it("returns list of notes", async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: "usr_1" } });
      mockPrisma.feedback.findFirst.mockResolvedValueOnce({ id: "fb_1" });
      mockPrisma.feedbackNote.findMany.mockResolvedValueOnce([
        {
          id: "note_1",
          feedbackId: "fb_1",
          userId: "usr_1",
          content: "First note",
          createdAt: new Date("2026-09-15T12:00:00Z"),
          updatedAt: new Date("2026-09-15T12:00:00Z"),
          user: { id: "usr_1", name: "Alice", email: "alice@example.com", image: null },
        },
      ]);

      const req = new Request("http://localhost/api/feedback/fb_1/notes");
      const res = await GET(req, { params: Promise.resolve({ id: "fb_1" }) });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveLength(1);
      expect(data[0].content).toBe("First note");
      expect(data[0].user.name).toBe("Alice");
    });
  });

  describe("POST /api/feedback/[id]/notes", () => {
    it("creates note and sets firstRespondedAt if absent", async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: "usr_1" } });
      mockPrisma.feedback.findFirst.mockResolvedValueOnce({
        id: "fb_1",
        firstRespondedAt: null,
      });

      mockPrisma.feedbackNote.create.mockResolvedValueOnce({
        id: "note_1",
        feedbackId: "fb_1",
        userId: "usr_1",
        content: "Investigating this bug",
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { id: "usr_1", name: "Alice", email: "alice@example.com", image: null },
      });

      const req = new Request("http://localhost/api/feedback/fb_1/notes", {
        method: "POST",
        body: JSON.stringify({ content: "Investigating this bug" }),
      });

      const res = await POST(req, { params: Promise.resolve({ id: "fb_1" }) });
      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.id).toBe("note_1");
      expect(data.content).toBe("Investigating this bug");
    });
  });

  describe("DELETE /api/feedback/[id]/notes/[noteId]", () => {
    it("allows note author to delete the note", async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: "usr_author" } });
      mockPrisma.feedbackNote.findUnique.mockResolvedValueOnce({
        id: "note_1",
        feedbackId: "fb_1",
        userId: "usr_author",
        feedback: { project: { userId: "usr_owner" } },
      });
      mockPrisma.feedbackNote.delete.mockResolvedValueOnce({ id: "note_1" });

      const req = new Request("http://localhost/api/feedback/fb_1/notes/note_1", {
        method: "DELETE",
      });

      const res = await DELETE(req, {
        params: Promise.resolve({ id: "fb_1", noteId: "note_1" }),
      });

      expect(res.status).toBe(204);
      expect(mockPrisma.feedbackNote.delete).toHaveBeenCalledWith({
        where: { id: "note_1" },
      });
    });

    it("rejects non-author non-owner with 403", async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: "usr_stranger" } });
      mockPrisma.feedbackNote.findUnique.mockResolvedValueOnce({
        id: "note_1",
        feedbackId: "fb_1",
        userId: "usr_author",
        feedback: { project: { userId: "usr_owner" } },
      });

      const req = new Request("http://localhost/api/feedback/fb_1/notes/note_1", {
        method: "DELETE",
      });

      const res = await DELETE(req, {
        params: Promise.resolve({ id: "fb_1", noteId: "note_1" }),
      });

      expect(res.status).toBe(403);
    });
  });
});
