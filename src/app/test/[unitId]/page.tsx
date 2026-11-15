import type { Metadata } from "next";
import { Suspense } from "react";

import { UNITS } from "@/features/content";
import { SessionSkeleton } from "@/features/learning/components/session-skeleton";
import { TestScreen } from "@/features/learning/components/test-screen";

export const metadata: Metadata = {
  title: "Unit test",
  description: "Check what you remember from the unit.",
};

export function generateStaticParams() {
  return UNITS.map((unit) => ({ unitId: unit.id }));
}

type Params = PageProps<"/test/[unitId]">["params"];

async function TestRoute({ params }: { params: Params }) {
  const { unitId } = await params;
  return <TestScreen unitId={unitId} />;
}

export default function TestPage({ params }: PageProps<"/test/[unitId]">) {
  // The route parameter is read inside <Suspense> so navigation shows the
  // skeleton at once instead of waiting for it.
  return (
    <Suspense fallback={<SessionSkeleton />}>
      <TestRoute params={params} />
    </Suspense>
  );
}
