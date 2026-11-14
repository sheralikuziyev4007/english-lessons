import type { Metadata } from "next";

import { UNITS } from "@/features/content";
import { TestScreen } from "@/features/learning/components/test-screen";

export const metadata: Metadata = {
  title: "Unit test",
  description: "Check what you remember from the unit.",
};

export function generateStaticParams() {
  return UNITS.map((unit) => ({ unitId: unit.id }));
}

export default async function TestPage({ params }: PageProps<"/test/[unitId]">) {
  const { unitId } = await params;
  return <TestScreen unitId={unitId} />;
}
