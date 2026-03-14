"use client";

import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { useSidebar } from '@/context/sidebar-context'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useRouter } from 'next/navigation'
import { LogOut, Menu } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { SidebarNav } from '@/components/Sidebar'

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/incomes': 'Ingresos',
  '/expenses': 'Gastos',
  '/debts': 'Deudas',
}

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { mobileOpen, setMobileOpen } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.replace("/");
  };

  const pageTitle = routeTitles[pathname] || 'DebtFlow'

  const userInitials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : 'U'

  return (
    <nav className="flex items-center justify-between border-b border-border px-6 py-3">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              className="sm:hidden text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Abrir menú"
            >
              <Menu size={20} />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-60 p-0 bg-sidebar">
            <SheetHeader className="px-6 py-5 border-b border-sidebar-border">
              <SheetTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <span className="text-sm font-bold text-primary-foreground">D</span>
                </div>
                <span className="text-lg font-semibold tracking-tight">DebtFlow</span>
              </SheetTitle>
            </SheetHeader>
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
            {user && (
              <div className="border-t border-sidebar-border px-3 py-4 mt-auto">
                <div className="flex items-center gap-3 rounded-md px-3 py-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-muted text-xs font-medium">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Cerrar sesión"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>

        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">DebtFlow</BreadcrumbLink>
            </BreadcrumbItem>
            {pathname !== '/dashboard' && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
            {pathname === '/dashboard' && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {user && (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-muted text-xs font-medium">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors sm:hidden"
            aria-label="Cerrar sesión"
          >
            <LogOut size={16} />
          </button>
        </div>
      )}
    </nav>
  )
}

export default Navbar
