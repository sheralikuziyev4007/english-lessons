/** "  ali   VALIYEV " -> "ali VALIYEV" */
export function cleanName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

/**
 * Accounts are found by name without regard to letter case or the kind of
 * apostrophe typed, so "Og'abek", "og’abek" and "OGʻABEK" are one account.
 */
export function nameKey(name: string): string {
  return cleanName(name).replace(/[’ʻ`]/g, "'").toLocaleLowerCase("en-US");
}
