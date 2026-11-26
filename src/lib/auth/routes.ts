/** Pages for logged-out users. Logged-in users visiting them are sent home. */
const AUTH_PAGES = ["/login", "/signup"];

/** Paths anyone can open, logged in or not (e.g. the email confirmation link). */
const OPEN_PREFIXES = ["/auth/"];

const matches = (pathname: string, path: string) =>
  pathname === path || pathname.startsWith(`${path}/`);

export type RouteDecision = { redirectTo: string } | null;

/**
 * Where to send a request, given whether the user is logged in.
 * Returns null to let the request through.
 */
export function routeDecision(
  pathname: string,
  loggedIn: boolean,
): RouteDecision {
  if (OPEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return null;

  const isAuthPage = AUTH_PAGES.some((page) => matches(pathname, page));
  if (isAuthPage) return loggedIn ? { redirectTo: "/" } : null;

  return loggedIn ? null : { redirectTo: "/login" };
}
