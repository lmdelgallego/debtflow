function Layout({ children }: { children: React.ReactNode}) {
  return (
    <div className="p-6 space-y-6">
      {children}
    </div>
  )
}

export default Layout;
