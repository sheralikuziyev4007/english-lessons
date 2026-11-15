/**
 * Speech recognisers write what they hear as ordinary text, so a correctly
 * spoken word can come back as a digit ("3") or as a word that sounds the
 * same ("for" instead of "four"). These spellings are accepted too.
 */
const SOUND_ALIKES: Readonly<Record<string, readonly string[]>> = {
  one: ["1", "won"],
  two: ["2", "to", "too"],
  three: ["3"],
  four: ["4", "for"],
  five: ["5"],
  six: ["6"],
  seven: ["7"],
  eight: ["8", "ate"],
  nine: ["9"],
  ten: ["10"],
  red: ["read"],
  blue: ["blew"],
  eye: ["i", "aye"],
  nose: ["knows"],
  hair: ["hare"],
  bear: ["bare"],
  plane: ["plain"],
  eleven: ["11"],
  twelve: ["12"],
  thirteen: ["13"],
  fourteen: ["14"],
  fifteen: ["15"],
  sixteen: ["16"],
  seventeen: ["17"],
  eighteen: ["18"],
  nineteen: ["19"],
  twenty: ["20"],
  thirty: ["30"],
  forty: ["40", "fourty"],
  fifty: ["50"],
  sixty: ["60"],
  seventy: ["70"],
  eighty: ["80"],
  ninety: ["90"],
  hundred: ["100"],
  first: ["1st"],
  second: ["2nd"],
  sea: ["see", "c"],
  see: ["sea", "c"],
  bee: ["be", "b"],
  tea: ["tee", "t"],
  pear: ["pair"],
  meat: ["meet"],
  sun: ["son"],
  flower: ["flour"],
  pie: ["pi"],
  write: ["right"],
  buy: ["by", "bye"],
  wait: ["weight"],
  road: ["rode"],
  night: ["knight"],
  whale: ["wail"],
  new: ["knew"],
  rain: ["reign"],
};

/** "It's a CAT!" -> ["its", "a", "cat"] */
function toTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * True when any of the recogniser's guesses contains the expected word.
 * Extra words are fine: a child may say "a cat" or "it is a cat".
 */
export function matchesSpokenWord(expected: string, heard: readonly string[]): boolean {
  const target = expected.toLowerCase();
  const accepted = new Set([target, ...(SOUND_ALIKES[target] ?? [])]);

  return heard.some((guess) => {
    const tokens = toTokens(guess);
    // "icecream"-style joins: the recogniser may glue or split short words.
    return tokens.some((token) => accepted.has(token)) || tokens.join("") === target;
  });
}
