import { describe, expect, it } from "vitest";
import { fitAdvice, REC } from "@/lib/fit";
import { SIZES } from "@/lib/catalog";

describe("fitAdvice", () => {
  it("suggests a size when none is picked", () => {
    expect(fitAdvice(1, 1, undefined).text).toContain(`we suggest ${SIZES[REC[1]]}`);
  });
  it("calls the suggested size a true fit", () => {
    expect(fitAdvice(2, 1, "XL")).toMatchObject({ tone: "ok" });
    expect(fitAdvice(2, 1, "XL").text).toMatch(/^True fit/);
  });
  it("warns two sizes down", () => {
    expect(fitAdvice(2, 1, "M").tone).toBe("bad");
  });
  it("adds a hem note for tall frames at true fit or smaller", () => {
    expect(fitAdvice(1, 2, "L").text).toContain("hem sits a little high");
  });
});
