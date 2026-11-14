import { expect, test } from "@playwright/test";

import { completeSession, login, openParentPanel, visible } from "./helpers";

// One learner story per browser project; the steps depend on each other.
test.describe.configure({ mode: "serial" });

test("rejects a wrong family password", async ({ page }) => {
  await page.goto("/login");
  await page.locator("#family-password").fill("not-the-password");
  await page.locator('button[type="submit"]').click();
  await expect(page.locator("#family-password-error")).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test("sends a visitor without a session to the login page", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
});

test("child earns the prize the parent set for a unit", async ({ page }, testInfo) => {
  // Each project uses its own unit so the two runs do not share progress.
  test.skip(
    testInfo.project.name !== "mobile",
    "The full story runs once, on the mobile project.",
  );
  test.setTimeout(120_000);

  await login(page);

  // Parent sets a prize for the first unit.
  await openParentPanel(page);
  await page.locator("#prize-unit").selectOption("colours");
  await page.locator("#prize-title").fill("Bicycle bell");
  await page.locator("#prize-score").fill("80");
  await page
    .locator("form[aria-labelledby='prize-form-title'] button[type='submit']")
    .click();
  await expect(visible(page, "prize-item")).toHaveAttribute("data-status", "active");

  // Child sees the prize and finishes both lessons.
  await page.goto("/");
  await expect(visible(page, "prize-banner")).toContainText("Bicycle bell");

  for (const lessonId of ["colours-1", "colours-2"]) {
    await visible(page, "plan-study").click();
    await expect(page).toHaveURL(new RegExp(`/lesson/${lessonId}$`));
    await completeSession(page);
    await expect(visible(page, "result-score")).toHaveText("100%");
    await visible(page, "result").getByRole("link").click();
    await expect(visible(page, "daily-plan")).toBeVisible();
  }
  await expect(visible(page, "stat-stars")).toContainText("6");

  // The unit test awards the prize.
  await visible(page, "plan-study").click();
  await expect(page).toHaveURL(/\/test\/colours$/);
  await completeSession(page);
  await expect(visible(page, "prize-earned")).toContainText("Bicycle bell");

  // Parent sees the result and hands the prize over.
  await openParentPanel(page);
  await expect(visible(page, "summary-lessons")).toContainText("2 / 24");
  await expect(visible(page, "prize-item")).toHaveAttribute("data-status", "earned");
  await visible(page, "prize-item").getByRole("button").click();
  await expect(visible(page, "prize-item")).toHaveAttribute("data-status", "given");
});

test("passing a unit test opens only the next unit", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Depends on the mobile story above.");
  await login(page);

  // Unit 2 is open after the passed test; unit 3 is still locked.
  const numbers = page.locator('[data-unit-id="numbers"]').filter({ visible: true });
  const animals = page.locator('[data-unit-id="animals"]').filter({ visible: true });
  await expect(numbers.getByRole("link").first()).toBeVisible();
  await expect(animals.getByRole("link")).toHaveCount(0);
});
