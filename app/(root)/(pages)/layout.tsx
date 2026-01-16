function Layout({ children }: { children: React.ReactNode}) {
  return (
    <div className="border-[1px] pb-20 h-screen rounded-3xl border-muted-foreground/20 overflow-scroll dark:bg-background/40">
      {children}
    </div>
  )
}

export default Layout;