import type { Metadata } from "next";

import { ReviewScreen } from "@/features/learning/components/review-screen";

export const metadata: Metadata = {
  title: "Review",
  description: "Repeat the words that are due today.",
};

export default function ReviewPage() {
  return <ReviewScreen />;
}
