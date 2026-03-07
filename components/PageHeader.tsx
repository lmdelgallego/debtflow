interface PageHeaderProps {
  children: React.ReactNode;
}

type PageHeaderCompoundComponent = ((props: PageHeaderProps) => React.JSX.Element) & {
  Title: (props: { children: React.ReactNode }) => React.JSX.Element;
  Description: (props: { children: React.ReactNode }) => React.JSX.Element;
};

const PageHeader = (({ children }: PageHeaderProps) => {
  return (
    <div className="space-y-1">
      {children}
    </div>
  );
}) as PageHeaderCompoundComponent;

const PageHeaderTitle = ({ children }: { children: React.ReactNode }) => (
  <h1 className="text-2xl font-semibold tracking-tight">{children}</h1>
);

PageHeaderTitle.displayName = "PageHeader.Title";

const PageHeaderDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-muted-foreground">{children}</p>
);

PageHeaderDescription.displayName = "PageHeader.Description";

PageHeader.Title = PageHeaderTitle;
PageHeader.Description = PageHeaderDescription;

export { PageHeader };
