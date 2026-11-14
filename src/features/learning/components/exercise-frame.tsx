"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ExerciseFrameProps {
  title: string;
  type: string;
  wordId?: string;
  children: ReactNode;
}

/** Shared wrapper: moves focus to the question so keyboard users start there. */
export function ExerciseFrame({ title, type, wordId, children }: ExerciseFrameProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <section
      data-testid="exercise"
      data-type={type}
      data-word-id={wordId}
      className="flex flex-col items-center gap-6"
    >
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="text-center text-2xl font-black outline-none sm:text-3xl"
      >
        {title}
      </h1>
      {children}
    </section>
  );
}
