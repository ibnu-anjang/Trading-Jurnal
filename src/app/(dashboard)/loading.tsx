import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-7 rounded-lg" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <Skeleton className="h-6 sm:h-7 w-24 mb-2" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Equity Curve */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2 space-y-2">
          <Skeleton className="h-4 w-32" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-28" />
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:px-4">
          <Skeleton className="h-48 sm:h-64 w-full" />
        </CardContent>
      </Card>

      {/* Breakdown grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-28" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-36 w-full" />
            </CardContent>
          </Card>
        ))}
        <Card className="bg-zinc-900 border-zinc-800 lg:col-span-2">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-28" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-44 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
