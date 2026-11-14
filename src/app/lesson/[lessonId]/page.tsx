import type { Metadata } from "next";

import { ALL_LESSONS } from "@/features/content";
import { LessonScreen } from "@/features/learning/components/lesson-screen";

export const metadata: Metadata = {
  title: "Lesson",
  description: "Learn new English words and practise them.",
};

export function generateStaticParams() {
  return ALL_LESSONS.map((lesson) => ({ lessonId: lesson.id }));
}

export default async function LessonPage({ params }: PageProps<"/lesson/[lessonId]">) {
  const { lessonId } = await params;
  return <LessonScreen lessonId={lessonId} />;
}
