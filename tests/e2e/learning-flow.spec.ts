import { expect, test } from "@playwright/test";

import {
  completeSession,
  fakeMicrophone,
  login,
  openAccount,
  openAdmin,
  openParent,
  visible,
} from "./helpers";

const ALI_PIN = "1357";
const VALI_PIN = "2468";
const STARTERS_UNIT_IDS = [
  "colours",
  "numbers",
  "animals",
  "family",
  "body",
  "food",
  "school",
  "home",
  "clothes",
  "toys",
  "transport",
  "zoo",
];

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

test("a learner registers by name and earns the prize set by the parent", async ({
  page,
}) => {
  test.setTimeout(120_000);

  await login(page, "Ali");
  await expect(visible(page, "greeting")).toContainText("Ali");

  // The parent opens their section for the first time, chooses a PIN and sets a prize.
  await visible(page, "parent-link").click();
  await expect(page).toHaveURL(/\/parent$/);
  await openParent(page, ALI_PIN);
  await expect(visible(page, "summary-lessons")).toContainText("0 / 72");
  await page.locator("#prize-unit").selectOption("colours");
  await page.locator("#prize-title").fill("Bicycle bell");
  await page.locator("#prize-score").fill("80");
  await page
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

  // The parent sees the results and hands the prize over.
  await openParent(page, ALI_PIN);
  await expect(visible(page, "summary-lessons")).toContainText("2 / 72");
  await expect(visible(page, "prize-item")).toHaveAttribute("data-status", "earned");
  await visible(page, "prize-item").getByRole("button").click();
  await expect(visible(page, "prize-item")).toHaveAttribute("data-status", "given");
});

test("the admin sees every account, its results and a private comment", async ({
  page,
}) => {
  await openAdmin(page);
  await expect(visible(page, "accounts-count")).toContainText("1");

  const detail = await openAccount(page, "Ali");
  await expect(visible(page, "summary-lessons")).toContainText("2 / 72");
  await expect(visible(page, "prize-item")).toHaveAttribute("data-status", "given");

  await detail.locator("#account-note").fill("My nephew, 2nd grade");
  await detail.locator("form:has(#account-note) button[type='submit']").click();
  await expect(visible(page, "note-saved")).toBeVisible();

  const reopened = await openAccount(page, "Ali");
  await expect(reopened.locator("#account-note")).toHaveValue("My nephew, 2nd grade");
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

test("the parent section belongs to one account and stays behind its PIN", async ({
  page,
}) => {
  // Vali's parent sees Vali's results, not Ali's, and chooses a separate PIN.
  await login(page, "Vali");
  await openParent(page, VALI_PIN);
  await expect(visible(page, "parent-dashboard")).toContainText("Vali");
  await expect(visible(page, "summary-lessons")).toContainText("0 / 72");
  await expect(page.getByTestId("prize-item")).toHaveCount(0);

  // After locking, a wrong PIN does not open it.
  await visible(page, "parent-dashboard").getByRole("button").first().click();
  const enterForm = visible(page, "pin-enter-form");
  await enterForm.locator("#parent-pin").fill("0000");
  await enterForm.locator('button[type="submit"]').click();
  await expect(page.locator("#parent-pin-error").filter({ visible: true })).toBeVisible();
  await expect(
    page.getByTestId("parent-dashboard").filter({ visible: true }),
  ).toHaveCount(0);

  // Ali's PIN does not open Vali's section either.
  await enterForm.locator("#parent-pin").fill(ALI_PIN);
  await enterForm.locator('button[type="submit"]').click();
  await expect(page.locator("#parent-pin-error").filter({ visible: true })).toBeVisible();

  // The admin can reset a forgotten PIN; the parent then chooses a new one.
  const detail = await openAccount(page, "Vali");
  await detail.getByTestId("pin-status").scrollIntoViewIfNeeded();
  await detail.locator("[data-testid='pin-status'] + button").click();
  await expect(detail.locator("[data-testid='pin-status'] + button")).toHaveCount(0);

  await page.goto("/parent");
  await expect(visible(page, "pin-create-form")).toBeVisible();
});

test("speaking practice checks the voice, allows a retry and never blocks", async ({
  page,
}) => {
  test.setTimeout(60_000);
  // The fake microphone hears: silence, a wrong word, then the right word.
  await fakeMicrophone(page, [null, "banana", "it is red"]);
  await login(page, "Speaker");
  await page.goto("/lesson/colours-1");

  // The first new-word card is "red".
  const card = visible(page, "exercise");
  await expect(card).toHaveAttribute("data-word-id", "red");
  const status = visible(page, "speak-status");
  await expect(status).toHaveAttribute("data-status", "idle");

  await card.getByTestId("speak-button").click();
  await expect(status).toHaveAttribute("data-status", "failed");

  await card.getByTestId("speak-button").click();
  await expect(status).toHaveAttribute("data-status", "heard");
  await expect(status).toContainText("banana");

  // The third attempt is right: the learner is praised by name.
  await card.getByTestId("speak-button").click();
  await expect(status).toHaveAttribute("data-status", "correct");
  await expect(status).toContainText("Speaker");

  // The other cards are passed without speaking; the lesson still ends with 100%.
  await completeSession(page);
  await expect(visible(page, "result-score")).toHaveText("100%");
});

test("Movers opens after Starters and asks words inside sentences", async ({ page }) => {
  test.setTimeout(60_000);
  await login(page, "Mover");

  // A new learner starts in Starters; Movers is closed.
  const starters = page.locator('[data-stage="starters"]').filter({ visible: true });
  const movers = page.locator('[data-stage="movers"]').filter({ visible: true });
  await expect(starters).toHaveAttribute("open", "");
  await expect(movers).not.toHaveAttribute("open", "");
  await expect(movers.getByRole("link")).toHaveCount(0);

  // Finish Starters quickly through the API: one passed test per unit.
  for (const refId of STARTERS_UNIT_IDS) {
    const response = await page.request.post("/api/sessions", {
      data: {
        kind: "test",
        refId,
        durationSec: 60,
        answers: [{ wordId: "red", correct: true }],
      },
    });
    expect(response.status()).toBe(201);
  }

  // Now the first Movers unit is unlocked and its first lesson can be opened.
  await page.goto("/");
  await movers.locator("summary").click();
  await movers.locator('[data-unit-id="teens"]').getByRole("link").first().click();
  await expect(page).toHaveURL(/\/lesson\/teens-1$/);

  // Movers lessons include read-and-choose sentence questions.
  const { sentenceQuestions } = await completeSession(page);
  expect(sentenceQuestions).toBeGreaterThan(0);
  await expect(visible(page, "result-score")).toHaveText("100%");
});
