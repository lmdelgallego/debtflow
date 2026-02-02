function Layout({ children }: { children: React.ReactNode}) {
  return (
    <div className="py-20 h-screen overflow-scroll dark:bg-background/40 p-8 space-y-8">
      {children}
    </div>
  )
}

export default Layout;