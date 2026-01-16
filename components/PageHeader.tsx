interface PageHeaderProps {
  children: React.ReactNode;
}

const PageHeader = ({ children }: PageHeaderProps) => {
  return (
    <div className="space-y-2">
      {children}
    </div>
  );
};

PageHeader.Title = ({ children }: { children: React.ReactNode }) => (
  <h1 className="text-3xl font-bold">{children}</h1>
);

PageHeader.Description = ({ children }: { children: React.ReactNode }) => (
  <p className="text-muted-foreground">{children}</p>
);

export { PageHeader };