export function DebtSummarySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="p-6 rounded-lg border border-border bg-card animate-fade-in-up" style={{ animationDelay: `${i * 75}ms` }}>
          <div className="h-4 bg-muted rounded w-1/2 mb-3 animate-pulse-subtle" />
          <div className="h-8 bg-muted rounded w-2/3 animate-pulse-subtle" />
        </div>
      ))}
    </div>
  );
}

export function DebtTableSkeleton() {
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
