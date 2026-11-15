import type { Metadata } from "next";
import { Suspense } from "react";

import { ALL_LESSONS } from "@/features/content";
import { LessonScreen } from "@/features/learning/components/lesson-screen";
import { SessionSkeleton } from "@/features/learning/components/session-skeleton";

export const metadata: Metadata = {
  title: "Lesson",
  description: "Learn new English words and practise them.",
};

export function generateStaticParams() {
  return ALL_LESSONS.map((lesson) => ({ lessonId: lesson.id }));
}

type Params = PageProps<"/lesson/[lessonId]">["params"];

async function LessonRoute({ params }: { params: Params }) {
  const { lessonId } = await params;
  return <LessonScreen lessonId={lessonId} />;
}

export default function LessonPage({ params }: PageProps<"/lesson/[lessonId]">) {
  // The route parameter is read inside <Suspense> so navigation shows the
  // skeleton at once instead of waiting for it.
  return (
    <Suspense fallback={<SessionSkeleton />}>
      <LessonRoute params={params} />
    </Suspense>
  );
}
