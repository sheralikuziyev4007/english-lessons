import { expect, test } from "@playwright/test";

import { completeSession, login, openAccount, openAdmin, visible } from "./helpers";

// One story told in order; the steps build on each other's data.
test.describe.configure({ mode: "serial" });

test("sends a visitor without a session to the login page", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
});

test("asks for a real name", async ({ page }) => {
  await page.goto("/login");
  await page.locator("#learner-name").fill("A1");
  await page.locator('button[type="submit"]').click();
  await expect(page.locator("#learner-name-error")).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test("keeps the admin section behind its password", async ({ page }) => {
  await page.goto("/admin");
  await page.locator("#admin-password").fill("not-the-password");
  await page.locator("#admin-password").press("Enter");
  await expect(page.locator("#admin-password-error")).toBeVisible();
  await expect(page.getByTestId("accounts-count")).toHaveCount(0);
});

test("a learner registers by name and earns the prize set by the admin", async ({
  page,
}) => {
  test.setTimeout(120_000);

  await login(page, "Ali");
  await expect(visible(page, "greeting")).toContainText("Ali");

  // Admin finds the new account, leaves a private comment and sets a prize.
  await openAdmin(page);
  await expect(visible(page, "accounts-count")).toContainText("1");
  const detail = await openAccount(page, "Ali");
  await detail.locator("#account-note").fill("My nephew, 2nd grade");
  await detail.locator("#account-note").press("Tab");
  await detail.locator("form:has(#account-note) button[type='submit']").click();
  await expect(visible(page, "note-saved")).toBeVisible();

  await detail.locator("#prize-unit").selectOption("colours");
  await detail.locator("#prize-title").fill("Bicycle bell");
  await detail.locator("#prize-score").fill("80");
  await detail
    .locator("form[aria-labelledby='prize-form-title'] button[type='submit']")
    .click();
  await expect(visible(page, "prize-item")).toHaveAttribute("data-status", "active");

  // The learner sees the prize and finishes both lessons.
  await page.goto("/");
  await expect(visible(page, "prize-banner")).toContainText("Bicycle bell");

  for (const lessonId of ["colours-1", "colours-2"]) {
    await visible(page, "plan-study").click();
    await expect(page).toHaveURL(new RegExp(`/lesson/${lessonId}$`));
    await completeSession(page);
    await expect(visible(page, "result-score")).toHaveText("100%");
    // The learner is addressed by name.
    await expect(visible(page, "result-title")).toContainText("Ali");
    await visible(page, "result").getByRole("link").click();
    await expect(visible(page, "daily-plan")).toBeVisible();
  }
  await expect(visible(page, "stat-stars")).toContainText("6");

  // The unit test awards the prize.
  await visible(page, "plan-study").click();
  await expect(page).toHaveURL(/\/test\/colours$/);
  await completeSession(page);
  await expect(visible(page, "prize-earned")).toContainText("Bicycle bell");

  // Admin sees the results and hands the prize over.
  const results = await openAccount(page, "Ali");
  await expect(results.locator("#account-note")).toHaveValue("My nephew, 2nd grade");
  await expect(visible(page, "summary-lessons")).toContainText("2 / 24");
  await expect(visible(page, "prize-item")).toHaveAttribute("data-status", "earned");
  await visible(page, "prize-item").getByRole("button").click();
  await expect(visible(page, "prize-item")).toHaveAttribute("data-status", "given");
});

test("the daily limit stops a regular account but not a VIP one", async ({ page }) => {
  await login(page, "Ali");

  // Two new lessons were finished today, so the third one is closed.
  await page.goto("/lesson/numbers-1");
  await expect(page.getByTestId("exercise")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 2 })).toBeVisible();

  const detail = await openAccount(page, "Ali");
  await detail.locator("#account-vip").check();
  await expect(detail.locator("#account-vip")).toBeChecked();

  await page.goto("/lesson/numbers-1");
  await expect(visible(page, "exercise")).toBeVisible();
});

test("each name is a separate account and the same name opens the same one", async ({
  page,
}) => {
  await login(page, "Vali");
  await expect(visible(page, "greeting")).toContainText("Vali");
  await expect(visible(page, "stat-stars")).toContainText("0");

  // Letter case and extra spaces do not create a duplicate account.
  await login(page, "  ali ");
  await expect(visible(page, "greeting")).toContainText("Ali");
  await expect(visible(page, "stat-stars")).toContainText("9");

  await openAdmin(page);
  await expect(visible(page, "accounts-count")).toContainText("2");
  await expect(page.getByTestId("account-item")).toHaveCount(2);
});
