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

export async function login(page: Page): Promise<void> {
  await page.goto("/login");
  await page.locator("#family-password").fill(E2E.password);
  await page.locator('button[type="submit"]').click();
  // The first request also boots the embedded test database.
  await expect(visible(page, "daily-plan")).toBeVisible({
    timeout: FIRST_LOAD_TIMEOUT_MS,
  });
}

/** Opens the parent panel, entering the PIN unless it is still unlocked. */
export async function openParentPanel(page: Page): Promise<void> {
  await page.goto("/parent");
  const pin = page.locator("#parent-pin").filter({ visible: true });
  const summary = visible(page, "summary-lessons");

  await expect(pin.or(summary).first()).toBeVisible();
  if (await pin.isVisible()) {
    await pin.fill(E2E.pin);
    await pin.press("Enter");
  }
  await expect(summary).toBeVisible();
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
