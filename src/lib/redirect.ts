/**
 * Turns a `?next=` value into a same-site path, or "/" if it would leave the site.
 * Resolving with URL catches tricks a prefix check misses, like `/\evil.com`, which browsers read as `//evil.com`.
 */
export function safeNextPath(next: string | null, origin: string): string {
  if (!next || !next.startsWith("/")) return "/";
  try {
    const url = new URL(next, origin);
    return url.origin === origin ? url.pathname + url.search + url.hash : "/";
  } catch {
    return "/";
  }
}
