export default function StoryLoading() {
  return (
    <main className="animate-pulse">
      {/* Story Hero Skeleton */}
      <section className="px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto pt-24 pb-12 md:pt-40 md:pb-20 text-center space-y-6">
        <div className="space-y-6">
          <div className="h-4 w-40 bg-bg-secondary rounded mx-auto" />
          <div className="h-16 w-96 bg-bg-secondary rounded mx-auto max-w-full" />
          <div className="h-20 w-[600px] bg-bg-secondary rounded mx-auto max-w-full" />
        </div>
      </section>

      {/* Philosophy Section Skeleton */}
      <section className="px-6 md:px-12 lg:px-20 py-20">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-4">
            <div className="h-8 w-48 bg-bg-secondary rounded" />
            <div className="h-4 w-full bg-bg-secondary rounded" />
            <div className="h-4 w-full bg-bg-secondary rounded" />
            <div className="h-4 w-3/4 bg-bg-secondary rounded" />
            <div className="h-4 w-5/6 bg-bg-secondary rounded" />
          </div>
          <div className="aspect-square bg-bg-secondary rounded-[20px]" />
        </div>
      </section>

      {/* Parallax Breakout Skeleton */}
      <div className="h-[70vh] w-full bg-bg-secondary" />

      {/* Atelier Section Skeleton */}
      <section className="px-6 md:px-12 lg:px-20 py-20">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="aspect-[4/5] bg-bg-secondary rounded-[20px]" />
          <div className="space-y-4">
            <div className="h-8 w-48 bg-bg-secondary rounded" />
            <div className="h-4 w-full bg-bg-secondary rounded" />
            <div className="h-4 w-full bg-bg-secondary rounded" />
            <div className="h-4 w-5/6 bg-bg-secondary rounded" />
            <div className="h-4 w-3/4 bg-bg-secondary rounded" />
            <div className="h-4 w-2/3 bg-bg-secondary rounded" />
          </div>
        </div>
      </section>

      {/* Story CTA Skeleton */}
      <section className="text-center py-24 px-6 space-y-6">
        <div className="h-12 w-80 bg-bg-secondary rounded mx-auto max-w-full" />
        <div className="h-12 w-44 bg-bg-secondary rounded-full mx-auto" />
      </section>
    </main>
  );
}
