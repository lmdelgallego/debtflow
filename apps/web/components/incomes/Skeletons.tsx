export function SummarySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-6 rounded-lg border border-border bg-card animate-fade-in-up" style={{ animationDelay: `${i * 75}ms` }}>
          <div className="h-4 bg-muted rounded w-1/2 mb-3 animate-pulse-subtle" />
          <div className="h-8 bg-muted rounded w-2/3 animate-pulse-subtle" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="p-6 rounded-lg border border-border bg-card animate-fade-in-up" style={{ animationDelay: `${i * 75}ms` }}>
          <div className="h-6 bg-muted rounded w-1/3 mb-4 animate-pulse-subtle" />
          <div className="h-80 bg-muted/30 rounded animate-pulse-subtle" />
        </div>
      ))}
    </div>
  );
}

export function StatisticsSkeleton() {
  return (
    <div className="p-6 rounded-lg border border-border bg-card animate-fade-in-up">
      <div className="h-6 bg-muted rounded w-1/4 mb-4 animate-pulse-subtle" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-4 rounded-lg bg-muted/30">
            <div className="h-3 bg-muted rounded w-full mb-2 animate-pulse-subtle" />
            <div className="h-5 bg-muted rounded w-2/3 animate-pulse-subtle" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="p-6 rounded-lg border border-border bg-card animate-fade-in-up">
      <div className="h-6 bg-muted rounded w-1/4 mb-4 animate-pulse-subtle" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-muted/30 rounded animate-pulse-subtle" style={{ animationDelay: `${i * 100}ms` }} />
        ))}
      </div>
    </div>
  );
}

export function LineChartSkeleton() {
  return (
    <div className="p-6 rounded-lg border border-border bg-card animate-fade-in-up">
      <div className="h-6 bg-muted rounded w-1/3 mb-4 animate-pulse-subtle" />
      <div className="h-80 bg-muted/30 rounded animate-pulse-subtle" />
    </div>
  );
}
