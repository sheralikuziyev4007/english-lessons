import { describe, expect, it } from "vitest";

import { cleanName, nameKey } from "@/features/auth/lib/name";
import { loginSchema } from "@/features/auth/schemas";

function parse(name: string) {
  return loginSchema.safeParse({ name });
}

describe("loginSchema", () => {
  it("accepts Latin and Cyrillic names and tidies the spaces", () => {
    expect(parse("  Ali   Valiyev ")).toMatchObject({
      success: true,
      data: { name: "Ali Valiyev" },
    });
    expect(parse("Шерали").success).toBe(true);
    expect(parse("Og'abek").success).toBe(true);
    expect(parse("Anna-Maria").success).toBe(true);
  });

  it("rejects names that are too short, too long or not made of letters", () => {
    expect(parse("A").success).toBe(false);
    expect(parse("a".repeat(31)).success).toBe(false);
    expect(parse("Ali123").success).toBe(false);
    expect(parse("<script>").success).toBe(false);
    expect(parse("   ").success).toBe(false);
  });
});

describe("nameKey", () => {
  it("treats letter case, extra spaces and apostrophe styles as the same name", () => {
    expect(cleanName("  Ali   Valiyev ")).toBe("Ali Valiyev");
    expect(nameKey("ALI  valiyev")).toBe(nameKey("Ali Valiyev"));
    expect(nameKey("Og’abek")).toBe(nameKey("ogʻabek"));
    expect(nameKey("Ali")).not.toBe(nameKey("Vali"));
  });
});
