import { describe, expect, it } from "vitest";
import { routeDecision } from "./routes";

const TABS = ["/", "/subs", "/calendar", "/shared", "/settings", "/subs/123"];

describe("logged out", () => {
  it("sends every app page to /login", () => {
    for (const path of TABS)
      expect(routeDecision(path, false)).toEqual({ redirectTo: "/login" });
  });
  it("lets the login and sign-up pages through", () => {
    expect(routeDecision("/login", false)).toBeNull();
    expect(routeDecision("/signup", false)).toBeNull();
  });
  it("lets the email confirmation link through", () => {
    expect(routeDecision("/auth/confirm", false)).toBeNull();
  });
  it("doesn't treat look-alike paths as public", () => {
    expect(routeDecision("/login-help", false)).toEqual({
      redirectTo: "/login",
    });
    expect(routeDecision("/signupx", false)).toEqual({ redirectTo: "/login" });
    expect(routeDecision("/authx", false)).toEqual({ redirectTo: "/login" });
  });
});

describe("logged in", () => {
  it("lets every app page through", () => {
    for (const path of TABS) expect(routeDecision(path, true)).toBeNull();
  });
  it("sends the login and sign-up pages home", () => {
    expect(routeDecision("/login", true)).toEqual({ redirectTo: "/" });
    expect(routeDecision("/signup", true)).toEqual({ redirectTo: "/" });
  });
  it("still lets the email confirmation link through", () => {
    expect(routeDecision("/auth/confirm", true)).toBeNull();
  });
});
