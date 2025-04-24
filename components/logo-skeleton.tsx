import { Skeleton } from "@/components/ui/skeleton"

export function LogoSkeleton() {
  return (
    <div className="w-full aspect-square bg-card/60 rounded-xl flex flex-col items-center justify-center p-6 backdrop-blur-sm scale-90 shadow-lg shadow-purple-500/5 overflow-hidden">
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        {/* Logo icon placeholder */}
        <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl mb-2" />

        {/* Logo text lines */}
        <div className="space-y-2 w-full max-w-[80%]">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4 mx-auto" />
        </div>

        {/* Circular design element */}
        <div className="absolute opacity-20">
          <Skeleton className="w-32 h-32 rounded-full" />
        </div>

        {/* Small decorative elements */}
        <div className="absolute bottom-4 right-4">
          <Skeleton className="w-6 h-6 rounded-md" />
        </div>
        <div className="absolute top-4 left-4">
          <Skeleton className="w-4 h-4 rounded-full" />
        </div>
      </div>
    </div>
  )
}
