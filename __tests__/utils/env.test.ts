import { describe, it, expect, afterAll } from "vitest";
import { requireEnv } from "@/utils/env";

describe("requireEnv", () => {
  const ORIGINAL_ENV = { ...process.env };

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("returns the env var value when present", () => {
    process.env.TEST_VAR = "hello";
    expect(requireEnv("TEST_VAR")).toBe("hello");
    delete process.env.TEST_VAR;
  });

  it("throws when env var is missing", () => {
    expect(() => requireEnv("MISSING_VAR")).toThrow(
      "Missing required env var: MISSING_VAR"
    );
  });

  it("throws when env var is empty string", () => {
    process.env.EMPTY_VAR = "";
    expect(() => requireEnv("EMPTY_VAR")).toThrow(
      "Missing required env var: EMPTY_VAR"
    );
    delete process.env.EMPTY_VAR;
  });
});
