import { describe, expect, it } from "vitest";
import { authErrorMessage, validateCredentials } from "./messages";

describe("validateCredentials", () => {
  it("accepts a normal email and 8+ character password", () => {
    expect(validateCredentials("person1@sorz.test", "hunter22")).toBeNull();
  });
  it("rejects missing or malformed emails", () => {
    expect(validateCredentials("", "hunter22")).toMatch(/valid email/);
    expect(validateCredentials("person1", "hunter22")).toMatch(/valid email/);
    expect(validateCredentials("person1@sorz", "hunter22")).toMatch(
      /valid email/,
    );
    expect(validateCredentials("a b@sorz.test", "hunter22")).toMatch(
      /valid email/,
    );
  });
  it("rejects passwords shorter than 8 characters", () => {
    expect(validateCredentials("person1@sorz.test", "short12")).toMatch(
      /at least 8/,
    );
    expect(validateCredentials("person1@sorz.test", "")).toMatch(/at least 8/);
  });
  it("rejects passwords Supabase can't store (over 72 bytes)", () => {
    const email = "person1@sorz.test";
    expect(validateCredentials(email, "x".repeat(72))).toBeNull();
    expect(validateCredentials(email, "x".repeat(73))).toMatch(/72 characters/);
    // Emoji take 4 bytes each: 18 fit, 19 don't.
    expect(validateCredentials(email, "🔑".repeat(18))).toBeNull();
    expect(validateCredentials(email, "🔑".repeat(19))).toMatch(/72/);
  });
  it("reports the email problem first", () => {
    expect(validateCredentials("nope", "short")).toMatch(/valid email/);
  });
});

describe("authErrorMessage", () => {
  it("explains wrong credentials without saying which part was wrong", () => {
    expect(authErrorMessage({ code: "invalid_credentials" })).toBe(
      "Wrong email or password.",
    );
  });
  it("covers unconfirmed emails, existing accounts and rate limits", () => {
    expect(authErrorMessage({ code: "email_not_confirmed" })).toMatch(
      /Confirm your email/,
    );
    expect(authErrorMessage({ code: "user_already_exists" })).toMatch(
      /already exists/,
    );
    expect(authErrorMessage({ code: "email_exists" })).toMatch(
      /already exists/,
    );
    expect(authErrorMessage({ code: "over_email_send_rate_limit" })).toMatch(
      /Too many/,
    );
  });
  it("falls back to a generic message, never leaking raw errors", () => {
    expect(
      authErrorMessage({ code: "unexpected_failure", message: "db exploded" }),
    ).toBe("Something went wrong. Please try again.");
    expect(authErrorMessage({})).toBe(
      "Something went wrong. Please try again.",
    );
  });
});
