function Block({ className = "" }: { className?: string }) {
  return <div className={`bg-muted animate-pulse rounded-2xl ${className}`} />;
}

export default function HomeLoading() {
  return (
    <div className="flex min-h-full flex-col gap-5 p-4 pb-8 sm:p-6 sm:pb-10 lg:p-8 lg:pb-12">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Block className="h-8 w-56" />
          <Block className="h-4 w-72" />
        </div>
        <Block className="h-11 w-36" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Block key={i} className="h-24" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Block className="h-80 lg:col-span-2" />
        <div className="flex flex-col gap-5">
          <Block className="h-40" />
          <Block className="h-36" />
        </div>
      </div>
    </div>
  );
}
