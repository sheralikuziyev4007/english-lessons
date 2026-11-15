import type { Metadata } from "next";

import { ParentScreen } from "@/features/parent/components/parent-screen";

export const metadata: Metadata = {
  title: "For parents",
  description: "Your child's results, activity and prizes.",
};

export default function ParentPage() {
  return <ParentScreen />;
}
