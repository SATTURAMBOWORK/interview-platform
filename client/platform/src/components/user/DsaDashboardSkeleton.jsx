import Skeleton from "../Skeleton";

const DsaDashboardSkeleton = () => {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050510]">
      <header className="relative border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 pb-10 pt-8 md:pb-14 md:pt-12">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-8 md:p-12">
            <Skeleton className="mb-4 h-6 w-40 rounded-full" />
            <Skeleton className="mb-4 h-10 w-96 rounded" />
            <Skeleton className="h-5 w-[32rem] rounded" />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] space-y-8 px-8 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:auto-rows-[minmax(150px,_auto)]">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-6 lg:col-span-4 lg:row-span-2">
            <Skeleton className="mb-4 h-8 w-40 rounded" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-6 lg:col-span-8 lg:row-span-2">
            <Skeleton className="mb-4 h-6 w-48 rounded" />
            <div className="grid grid-rows-7 grid-flow-col gap-1">
              {Array.from({ length: 70 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-4 rounded" />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-6 lg:col-span-4">
            <Skeleton className="mb-4 h-5 w-28 rounded" />
            <Skeleton className="mb-2 h-6 w-24 rounded" />
            <Skeleton className="mb-3 h-px w-full rounded" />
            <Skeleton className="h-6 w-24 rounded" />
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-6 lg:col-span-8">
            <Skeleton className="mb-3 h-6 w-24 rounded" />
            <Skeleton className="mb-4 h-1.5 w-full rounded" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg col-span-2 md:col-span-1" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-6 md:p-8">
          <Skeleton className="mb-6 h-6 w-56 rounded" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <Skeleton className="mb-3 h-5 w-40 rounded" />
                <Skeleton className="h-1.5 w-full rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DsaDashboardSkeleton;
