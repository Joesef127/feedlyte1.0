import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("workspace tenancy model", () => {
  it("defines the core workspace membership primitives", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");

    expect(schema).toContain("model Workspace");
    expect(schema).toContain("model Membership");
    expect(schema).toContain("model Invitation");
    expect(schema).toContain("model AuditEvent");
    expect(schema).toContain("workspaceId");
    expect(schema).toContain("MembershipRole");
    expect(schema).toContain("MembershipStatus");
  });
});
