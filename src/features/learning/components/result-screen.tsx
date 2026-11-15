"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Stars } from "@/components/ui/stars";
import type { SessionKind, SessionResult } from "@/features/progress/types";
import { useT } from "@/hooks/use-t";
import { PASS_SCORE, ROUTES, THREE_STAR_SCORE, TWO_STAR_SCORE } from "@/lib/constants";
import type { Dictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface ResultScreenProps {
  kind: SessionKind;
  learnerName: string;
  result: SessionResult | undefined;
  isError: boolean;
  onRetrySave: () => void;
  onRestart: () => void;
}

function getHeadline(score: number, name: string, t: Dictionary): string {
  if (score >= THREE_STAR_SCORE) return t.session.resultGood(name);
  if (score >= TWO_STAR_SCORE) return t.session.resultOk(name);
  return t.session.resultTry(name);
}

export function ResultScreen({
  kind,
  learnerName,
  result,
  isError,
  onRetrySave,
  onRestart,
}: ResultScreenProps) {
  const t = useT();

  if (isError) {
    return <ErrorState onRetry={onRetrySave} text={t.session.saveError} />;
  }

  if (!result) {
    return (
      <div
        role="status"
        className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-16"
      >
        <Skeleton className="size-28 rounded-full" />
        <Skeleton className="h-8 w-48" />
        <p className="text-ink-soft font-bold">{t.session.saving}</p>
      </div>
    );
  }

  const showRetry = kind === "test" ? !result.passed : result.score < TWO_STAR_SCORE;

  return (
    <motion.section
      data-testid="result"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-auto flex w-full max-w-md flex-col items-center gap-5 px-4 py-10 text-center"
    >
      <h1 data-testid="result-title" className="text-4xl font-black break-words">
        {getHeadline(result.score, learnerName, t)}
      </h1>

      {kind !== "review" && (
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.15 }}
        >
          <Stars
            count={result.stars}
            label={t.session.starsLabel(result.stars)}
            size="lg"
          />
        </motion.div>
      )}

      <div className="border-line bg-paper w-full rounded-3xl border-2 p-5">
        <p className="text-ink-soft text-sm font-extrabold uppercase">
          {t.session.scoreLabel}
        </p>
        <p data-testid="result-score" className="text-primary text-6xl font-black">
          {result.score}%
        </p>
        {kind === "test" && (
          <p
            className={cn(
              "mt-2 font-extrabold",
              result.passed ? "text-mint" : "text-coral",
            )}
          >
            {result.passed ? t.session.testPassed : t.session.testFailed(PASS_SCORE)}
          </p>
        )}
      </div>

      {result.prizeEarned && (
        <div
          data-testid="prize-earned"
          className="border-sun-dark bg-sun-soft w-full rounded-3xl border-2 p-5"
        >
          <span className="emoji text-5xl" aria-hidden="true">
            🎁
          </span>
          <p className="mt-2 text-2xl font-black">{t.prize.earnedTitle}</p>
          <p className="text-xl font-extrabold">{result.prizeEarned.title}</p>
          <p className="text-ink-soft mt-1 font-bold">{t.prize.earnedText}</p>
        </div>
      )}

      <div className="flex w-full flex-col gap-3">
        <Link href={ROUTES.home} className={buttonVariants({ size: "lg" })}>
          {t.session.backHome}
        </Link>
        {showRetry && (
          <Button variant="secondary" size="lg" onClick={onRestart}>
            {t.session.tryAgain}
          </Button>
        )}
      </div>
    </motion.section>
  );
}
