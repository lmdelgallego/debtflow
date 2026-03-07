function Layout({ children }: { children: React.ReactNode}) {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-income/5 blur-3xl" />
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </main>
  )
}

export default Layout;
