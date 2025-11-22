import { Skeleton } from "@/components/ui/skeleton";

export function ChatSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* User message skeleton */}
      <div className="flex gap-3 justify-end">
        <div className="flex flex-col gap-2 max-w-[80%] w-full sm:w-auto">
          <Skeleton className="h-12 w-full sm:w-64 md:w-80 ml-auto" />
        </div>
        <Skeleton className="flex-shrink-0 w-8 h-8 rounded-full" />
      </div>

      {/* Assistant message skeleton */}
      <div className="flex gap-3 justify-start">
        <Skeleton className="flex-shrink-0 w-8 h-8 rounded-full" />
        <div className="flex flex-col gap-2 max-w-[80%] w-full">
          <Skeleton className="h-20 w-full sm:w-96" />
        </div>
      </div>

      {/* User message skeleton */}
      <div className="flex gap-3 justify-end">
        <div className="flex flex-col gap-2 max-w-[80%] w-full sm:w-auto">
          <Skeleton className="h-10 w-full sm:w-48 md:w-56 ml-auto" />
        </div>
        <Skeleton className="flex-shrink-0 w-8 h-8 rounded-full" />
      </div>

      {/* Assistant message skeleton */}
      <div className="flex gap-3 justify-start">
        <Skeleton className="flex-shrink-0 w-8 h-8 rounded-full" />
        <div className="flex flex-col gap-2 max-w-[80%] w-full">
          <Skeleton className="h-16 w-full sm:w-80 md:w-[28rem]" />
        </div>
      </div>

      {/* User message skeleton */}
      <div className="flex gap-3 justify-end">
        <div className="flex flex-col gap-2 max-w-[80%] w-full sm:w-auto">
          <Skeleton className="h-14 w-full sm:w-72 md:w-96 ml-auto" />
        </div>
        <Skeleton className="flex-shrink-0 w-8 h-8 rounded-full" />
      </div>

      {/* Assistant message skeleton */}
      <div className="flex gap-3 justify-start">
        <Skeleton className="flex-shrink-0 w-8 h-8 rounded-full" />
        <div className="flex flex-col gap-2 max-w-[80%] w-full">
          <Skeleton className="h-24 w-full sm:w-full md:w-[32rem]" />
        </div>
      </div>
    </div>
  );
}
