import { cn } from '@/components/ui/cn';

type DashboardSkeletonProps = {
  className?: string;
};

export function DashboardSkeleton({ className }: DashboardSkeletonProps) {
  return (
    <div
      className={cn(
        'flex h-full min-h-0 w-full min-w-0 flex-1 animate-pulse flex-col gap-4 p-6',
        className,
      )}
      aria-hidden
    >
      <div className="h-8 w-48 rounded-lg bg-layer2" />
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-layer2 p-6">
          <div className="mb-4 h-5 w-32 rounded bg-layer2-half" />
          <div className="space-y-3">
            <div className="h-10 rounded-xl bg-layer2-half" />
            <div className="h-10 rounded-xl bg-layer2-half" />
            <div className="h-10 rounded-xl bg-layer2-half" />
          </div>
        </div>
        <div className="rounded-2xl bg-layer2 p-6">
          <div className="mb-4 h-5 w-40 rounded bg-layer2-half" />
          <div className="h-48 rounded-xl bg-layer2-half" />
        </div>
      </div>
    </div>
  );
}
