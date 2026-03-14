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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div className="p-6 rounded-lg border border-border bg-card animate-fade-in-up">
        <div className="h-6 bg-muted rounded w-1/3 mb-4 animate-pulse-subtle" />
        <div className="h-80 bg-muted/30 rounded animate-pulse-subtle" />
      </div>
      <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '75ms' }}>
        <div className="h-6 bg-muted rounded w-1/3 animate-pulse-subtle" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-6 rounded-lg border border-border bg-card">
            <div className="h-4 bg-muted rounded w-2/3 mb-3 animate-pulse-subtle" />
            <div className="h-8 bg-muted rounded w-1/2 animate-pulse-subtle" />
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
