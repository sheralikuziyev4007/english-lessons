import { describe, expect, it } from "vitest";

import { matchesSpokenWord } from "@/features/learning/lib/spoken-match";

describe("matchesSpokenWord", () => {
  it("accepts the word in any letter case and with punctuation", () => {
    expect(matchesSpokenWord("cat", ["Cat."])).toBe(true);
    expect(matchesSpokenWord("giraffe", ["GIRAFFE"])).toBe(true);
  });

  it("accepts the word inside a short phrase", () => {
    expect(matchesSpokenWord("cat", ["it is a cat"])).toBe(true);
    expect(matchesSpokenWord("apple", ["an apple!"])).toBe(true);
  });

  it("looks at every guess of the recogniser, not only the first", () => {
    expect(matchesSpokenWord("sheep", ["ship", "sheep", "cheap"])).toBe(true);
  });

  it("accepts digits and words that sound the same", () => {
    expect(matchesSpokenWord("three", ["3"])).toBe(true);
    expect(matchesSpokenWord("four", ["for"])).toBe(true);
    expect(matchesSpokenWord("eight", ["ate"])).toBe(true);
    expect(matchesSpokenWord("blue", ["blew"])).toBe(true);
  });

  it("accepts a word the recogniser split into pieces", () => {
    expect(matchesSpokenWord("handbag", ["hand bag"])).toBe(true);
  });

  it("rejects a different word", () => {
    expect(matchesSpokenWord("cat", ["dog"])).toBe(false);
    expect(matchesSpokenWord("cat", ["category"])).toBe(false);
    expect(matchesSpokenWord("three", ["tree"])).toBe(false);
    expect(matchesSpokenWord("cat", [])).toBe(false);
    expect(matchesSpokenWord("cat", [""])).toBe(false);
  });
});
