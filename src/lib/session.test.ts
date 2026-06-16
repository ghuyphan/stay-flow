import { describe, expect, it } from "vitest";
import { createAdminSession, verifyAdminSession } from "./session";

describe("admin session", () => {
  it("accepts only a token signed with the same secret", async () => {
    const token = await createAdminSession("secret-one");
    await expect(verifyAdminSession(token, "secret-one")).resolves.toBe(true);
    await expect(verifyAdminSession(token, "secret-two")).resolves.toBe(false);
  });
});
