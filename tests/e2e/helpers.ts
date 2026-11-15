import { expect, type Locator, type Page } from "@playwright/test";

import { E2E } from "../../playwright.config";

/**
 * Next.js keeps recently visited pages mounted but hidden, so the same test id
 * can exist twice in the DOM. Tests always target the visible one.
 */
export function visible(page: Page, testId: string): Locator {
  return page.getByTestId(testId).filter({ visible: true });
}

const FIRST_LOAD_TIMEOUT_MS = 20_000;

/** Signs in with a name only; a new name creates a new account. */
export async function login(page: Page, name: string): Promise<void> {
  await page.goto("/login");
  await page.locator("#learner-name").fill(name);
  await page.locator('button[type="submit"]').click();
  // The first request also boots the embedded test database.
  await expect(visible(page, "daily-plan")).toBeVisible({
    timeout: FIRST_LOAD_TIMEOUT_MS,
  });
}

/** Opens the admin section, entering the password unless it is still unlocked. */
export async function openAdmin(page: Page): Promise<void> {
  await page.goto("/admin");
  const password = page.locator("#admin-password").filter({ visible: true });
  const count = visible(page, "accounts-count");

  await expect(password.or(count).first()).toBeVisible({
    timeout: FIRST_LOAD_TIMEOUT_MS,
  });
  if (await password.isVisible()) {
    await password.fill(E2E.adminPassword);
    await password.press("Enter");
  }
  await expect(count).toBeVisible();
}

/** Opens the admin section and selects an account by its name. */
export async function openAccount(page: Page, name: string): Promise<Locator> {
  await openAdmin(page);
  await page.locator(`[data-testid="account-item"][data-account-name="${name}"]`).click();
  const detail = visible(page, "account-detail");
  await expect(detail.getByRole("heading", { name, exact: true })).toBeVisible();
  return detail;
}

/**
 * Opens the parent section of the logged-in account. Chooses the PIN on the
 * first visit, enters it later, and does nothing if it is still unlocked.
 */
export async function openParent(page: Page, pin: string): Promise<void> {
  await page.goto("/parent");
  const createForm = visible(page, "pin-create-form");
  const enterForm = visible(page, "pin-enter-form");
  const dashboard = visible(page, "parent-dashboard");

  await expect(createForm.or(enterForm).or(dashboard).first()).toBeVisible();
  if (await createForm.isVisible()) {
    await createForm.locator("#parent-pin").fill(pin);
    await createForm.locator("#parent-pin-confirm").fill(pin);
    await createForm.locator('button[type="submit"]').click();
  } else if (await enterForm.isVisible()) {
    await enterForm.locator("#parent-pin").fill(pin);
    await enterForm.locator('button[type="submit"]').click();
  }
  await expect(dashboard).toBeVisible();
}

/** Answers the question on screen. `correct: false` picks a wrong option where possible. */
async function answerStep(page: Page, correct: boolean): Promise<void> {
  const exercise = visible(page, "exercise");
  const type = await exercise.getAttribute("data-type");
  const wordId = (await exercise.getAttribute("data-word-id")) ?? "";

  switch (type) {
    case "intro":
      await exercise.getByRole("button").last().click();
      return;
    case "choice": {
      const selector = correct
        ? `[data-option-id="${wordId}"]`
        : `[data-testid="option"]:not([data-option-id="${wordId}"])`;
      await exercise.locator(selector).first().click();
      break;
    }
    case "build":
      // Word ids are the English words, so the id spells the answer.
      for (const letter of wordId) {
        await exercise
          .locator(`[data-letter="${letter}"]:not([disabled])`)
          .first()
          .click();
      }
      await exercise.getByRole("button").last().click();
      break;
    case "type":
      await exercise.getByTestId("type-input").fill(wordId);
      await exercise.getByTestId("type-input").press("Enter");
      break;
    case "match": {
      const pictures = exercise.getByTestId("match-picture");
      const ids = await pictures.evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute("data-word-id") ?? ""),
      );
      for (const id of ids) {
        await exercise
          .locator(`[data-testid="match-picture"][data-word-id="${id}"]`)
          .click();
        await exercise
          .locator(`[data-testid="match-word"][data-word-id="${id}"]`)
          .click();
      }
      break;
    }
    default:
      throw new Error(`Unknown exercise type: ${type}`);
  }

  await visible(page, "feedback").getByRole("button").click();
}

/**
 * Replaces the browser's speech recogniser with one that "hears" the queued
 * phrases in order (null = silence). Call before the page loads.
 */
export async function fakeMicrophone(
  page: Page,
  phrases: (string | null)[],
): Promise<void> {
  await page.addInitScript((queue: (string | null)[]) => {
    class FakeRecognition {
      onresult: ((event: unknown) => void) | null = null;
      onerror: ((event: unknown) => void) | null = null;
      onend: (() => void) | null = null;
      start() {
        setTimeout(() => {
          const phrase = queue.shift();
          if (phrase === null || phrase === undefined) {
            this.onerror?.({ error: "no-speech" });
          } else {
            this.onresult?.({
              results: [{ length: 1, isFinal: true, 0: { transcript: phrase } }],
            });
          }
          this.onend?.();
        }, 50);
      }
      abort() {}
    }
    Object.assign(window, {
      SpeechRecognition: FakeRecognition,
      webkitSpeechRecognition: FakeRecognition,
    });
  }, phrases);
}

/** Plays the open lesson, review or test to the result screen. */
export async function completeSession(
  page: Page,
  options = { correct: true },
): Promise<void> {
  const step = visible(page, "step");
  const result = visible(page, "result");
  await expect(step).toBeVisible();

  for (let guard = 0; guard < 80; guard += 1) {
    if (await result.isVisible()) return;
    const current = await step.getAttribute("data-step");
    await answerStep(page, options.correct);
    // Wait for the next question, or for the result once the last one is answered.
    const nextStep = page
      .locator(`[data-testid="step"]:not([data-step="${current}"])`)
      .filter({ visible: true });
    await expect(result.or(nextStep).first()).toBeVisible();
  }
  throw new Error("The session did not finish.");
}
