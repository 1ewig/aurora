import { describe, it, expect, afterAll } from "vitest";
import { isAdmin } from "@/utils/auth";

const ORIGINAL_ENV = { ...process.env };

afterAll(() => {
  process.env = ORIGINAL_ENV;
});

describe("isAdmin", () => {
  it("returns true when the DB role is admin regardless of email whitelist", () => {
    process.env.ADMIN_EMAILS = "";
    expect(isAdmin("someone@else.com", "admin")).toBe(true);
  });

  it("returns false for a non-admin role with an empty whitelist", () => {
    process.env.ADMIN_EMAILS = "";
    expect(isAdmin("user@test.com", "user")).toBe(false);
  });

  it("promotes a whitelisted email via the legacy ADMIN_EMAILS fallback", () => {
    process.env.ADMIN_EMAILS = "boss@example.com, founder@example.com";
    expect(isAdmin("founder@example.com", "user")).toBe(true);
  });

  it("matches the whitelist case-insensitively and trims whitespace", () => {
    process.env.ADMIN_EMAILS = "  Boss@Example.com ";
    expect(isAdmin("boss@example.com", "user")).toBe(true);
    expect(isAdmin("boss@example.com ", "user")).toBe(false);
  });

  it("returns false for emails outside the whitelist", () => {
    process.env.ADMIN_EMAILS = "boss@example.com";
    expect(isAdmin("stranger@example.com", "user")).toBe(false);
  });

  it("returns false when no email is provided", () => {
    process.env.ADMIN_EMAILS = "boss@example.com";
    expect(isAdmin(undefined, "user")).toBe(false);
  });
});
