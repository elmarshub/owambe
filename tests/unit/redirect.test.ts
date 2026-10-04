import { describe, expect, it } from "vitest";
import { safeNextPath } from "@/lib/redirect";

const origin = "https://owambe.martinelmars.com";

describe("safeNextPath", () => {
  it("keeps same-site paths with their query", () => {
    expect(safeNextPath("/?checkout=1", origin)).toBe("/?checkout=1");
    expect(safeNextPath("/orders", origin)).toBe("/orders");
  });
  it("falls back to / for anything that leaves the site", () => {
    for (const bad of ["//evil.com", "/\\evil.com", "/\\/evil.com", "https://evil.com", "evil.com", "", null]) {
      expect(safeNextPath(bad, origin)).toBe("/");
    }
  });
});
