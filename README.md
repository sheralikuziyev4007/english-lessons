# Starway English

A daily English course for young learners (age 7–9, starting from zero) with name-only accounts, a parent section, an admin section, prizes and spaced repetition. Vocabulary follows the Cambridge **Pre A1 Starters** wordlist.

**Live demo:** _add your Vercel URL here_

_Screenshot or GIF: add one here._

> Learners sign in with a name only, so anyone who has the link can open an account. The admin section is protected by a password. Search engines are told not to index the site.

## Features

**For the child**

- 12 units, 24 lessons, 118 words: colours, numbers, animals, family, body, food, school, home, clothes, toys, transport, zoo
- Lesson flow: new-word cards (picture, spelling, sound, Uzbek meaning) followed by 16 questions
- Five question types: picture → word, sound → picture, word → meaning, match the pairs, build or type the word
- Optional speaking practice on every new-word card: the learner says the word, the browser checks it, and they can retry or simply go on (Chrome, Edge and Safari; needs HTTPS or localhost and microphone permission)
- Missed questions come back at the end of the lesson
- Unit tests in the entrance-exam format (three options per question); 70% opens the next unit
- Spaced repetition (Leitner boxes): words return for review after 1, 2, 4, 8 and 16 days
- Daily plan: one lesson, word review and one task away from the screen
- Daily cap of two new lessons, so the course is not rushed (no cap on the VIP plan)
- Stars, day streak and a prize banner that shows the steps left
- Interface in Uzbek or English (toggle in the header)

**Accounts**

- Sign-in with a name only; a new name creates an account, the same name opens it again on any device
- Names are matched without regard to letter case, extra spaces or apostrophe style
- The learner is addressed by name on the home screen, in feedback and on result screens

**Parent section** (`/parent`, lock icon in the header)

- Belongs to the logged-in account and shows only that learner's results
- Protected by a 4-digit PIN the parent chooses on the first visit; each account has its own PIN
- Summary (streak, stars, words learned, lessons finished), minutes for the last 7 days, best test score per unit, most difficult words
- Set a prize for a unit and the test score needed to earn it; mark it as given later
- Tick off the daily offline task; roadmap towards the exam with an on-track indicator

**Admin section** (`/admin`, password protected, not linked from the app)

- List of all accounts with their number, registration date, lessons finished and last activity
- Private comment per account, visible only to the admin
- VIP plan per account: removes the daily limit on new lessons (also enforced on the server)
- The same results screen as the parent section, for any account
- Reset a forgotten parent PIN

## Tech stack

- **Framework:** Next.js 16 (App Router, Cache Components), React 19, TypeScript (strict)
- **UI:** Tailwind CSS v4, shadcn-style components (CVA + tailwind-merge), Framer Motion, lucide-react
- **Data:** TanStack Query, Zustand (interface language), React Hook Form + Zod
- **Backend:** Next.js Route Handlers, Drizzle ORM, PostgreSQL (Neon in production, embedded PGlite locally)
- **Auth:** signed HTTP-only cookies (jose); name-only learner accounts, password-protected admin
- **Tests:** Vitest, React Testing Library, Playwright
- **Tooling:** ESLint, Prettier

## Getting started

Requires Node.js 20.9 or newer.

```bash
npm ci
copy .env.example .env.local     # Windows (macOS/Linux: cp .env.example .env.local)
npm run dev
```

Open http://localhost:3000 and write a name to create an account. The admin section is at http://localhost:3000/admin; with an empty `.env.local` the development password is `admin`.

No database setup is needed locally: an embedded PostgreSQL (PGlite) is created in `./.pglite`. Delete that folder to reset all progress.

**Clean install on Windows.** If you unpack a newer copy of the project, extract it into a new empty folder (do not extract over the old one), then run `npm ci` again. If something looks stale, delete `node_modules`, `.next` and `.pglite` and repeat.

### Environment variables

| Name             | Required      | Purpose                                           |
| ---------------- | ------------- | ------------------------------------------------- |
| `ADMIN_PASSWORD` | in production | Password for the admin section at `/admin`        |
| `SESSION_SECRET` | in production | Long random string that signs the session cookies |
| `DATABASE_URL`   | on Vercel     | Neon PostgreSQL connection string                 |

### Scripts

| Command             | What it does                                  |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Development server                            |
| `npm run build`     | Production build                              |
| `npm run lint`      | ESLint                                        |
| `npm run typecheck` | Route type generation + `tsc --noEmit`        |
| `npm test`          | Unit and component tests (Vitest)             |
| `npm run test:e2e`  | End-to-end tests (Playwright, builds the app) |
| `npm run format`    | Prettier                                      |

For the end-to-end tests run `npx playwright install chromium` once, or use an installed Chrome:

```bash
set PW_CHANNEL=chrome
npm run test:e2e
```

## Deploying to Vercel

1. Push the repository to GitHub and import it in Vercel.
2. In the Vercel project open **Storage**, create a **Neon** Postgres database and connect it. Check that the project now has a `DATABASE_URL` environment variable.
3. Add `ADMIN_PASSWORD` and `SESSION_SECRET` under **Settings → Environment Variables**. Use a long admin password: the site itself is open to anyone with the link.
4. Deploy. Tables are created automatically on the first request; there is no migration step.

On the phone, open the site in Chrome and choose **Add to Home screen** to install it like an app.

## Folder structure

```
src/
  app/                    Routes and API route handlers
    api/                  auth, state, sessions, parent/*, admin/*
    lesson/[lessonId]/    Lesson page
    test/[unitId]/        Unit test page
    review/  parent/  admin/  login/
  components/
    ui/                   Button, Card, Input, ProgressBar, Stars, WordVisual…
    layout/               Header, language toggle, providers
  features/
    content/              Units, words, lessons (the course itself)
    learning/             Question generator, session player, exercises
    progress/             Progress types, unlock rules, state query
    home/                 Daily plan, prize banner, course path
    overview/             Results screen shared by the parent and admin sections
    parent/               Parent section and its PIN
    admin/                Accounts list, VIP, comments, PIN reset
    auth/                 Login
  hooks/                  useT, useLocalized, useMediaQuery…
  lib/                    Constants, dates, scoring, API client, i18n dictionaries
  server/                 Database schema and client, session cookies, services
  store/                  Zustand store (interface language)
tests/e2e/                Playwright tests
```

## Adding content

All course content lives in `src/features/content/data/units.ts`. Add a unit (or words to a unit) there and it appears on the path, in tests and in the parent and admin sections. Rules checked by the tests: unique word ids, single lowercase English words, no repeated picture or translation inside a unit.

## My role and problems solved

- **One code path, two databases.** Drizzle talks to Neon over HTTP in production and to embedded PGlite in development and tests, so the project runs locally with zero database setup. Tables are created by idempotent DDL at first use, which removes the migration step from deployment.
- **One results screen, two audiences.** The parent and admin sections render the same components; each supplies its own API calls through a small context, so nothing is duplicated.
- **Multi-account data model.** Every table is keyed by account, the name is normalised into a unique key, and account creation is a single race-safe upsert.
- **Free speech checking.** Speaking practice uses the browser's own speech recognition (no paid API). The matcher accepts digits and sound-alike spellings the recogniser returns ("4" or "for" for "four") and looks at every alternative guess; it is never scored, because recognition can mishear a correct answer.
- **Scoring cannot be faked by repeating.** Only first-attempt answers are sent to the server; the server computes the score, stars, spaced-repetition boxes and prize status.
- **Stale session screens.** Next.js 16 keeps visited pages alive in the background (React `<Activity>`), so reopening a lesson showed the previous result. Session screens are keyed by `router.bfcacheId` to start fresh on every new navigation.
- **Timezone-safe days.** Streaks, the daily limit and review dates use day keys calculated in `Asia/Tashkent`, not in the server's UTC clock.
- **Exam alignment.** Unit tests use the same three-option format as the entrance exam the learner is preparing for, and the question generator guarantees that no two options look the same.
- **Accessibility.** Semantic landmarks and headings, labelled controls, visible focus, keyboard-operable exercises, `lang` attributes on English and Uzbek text, reduced-motion support.
