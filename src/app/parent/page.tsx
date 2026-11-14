import type { Metadata } from "next";

import { ParentScreen } from "@/features/parent/components/parent-screen";

export const metadata: Metadata = {
  title: "Parent panel",
  description: "Results, activity and prizes for parents.",
};

export default function ParentPage() {
  return <ParentScreen />;
}
