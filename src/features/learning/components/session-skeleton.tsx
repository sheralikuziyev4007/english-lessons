import { Skeleton } from "@/components/ui/skeleton";

export function SessionSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 px-4 py-6">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-9 w-64" />
      <Skeleton className="size-36 rounded-full" />
      <div className="grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    </div>
  );
}
