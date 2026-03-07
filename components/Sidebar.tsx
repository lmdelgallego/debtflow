'use client';

import { sidebarLinks } from '@/constants/sidebar'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/auth-context'
import { useSidebar } from '@/context/sidebar-context'
import { useRouter } from 'next/navigation'
import { LogOut, PanelLeftClose, PanelLeft } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const colorMap: Record<string, string> = {
  primary: 'bg-primary',
  income: 'bg-income',
  expense: 'bg-expense',
  debt: 'bg-debt',
}

const activeColorMap: Record<string, string> = {
  primary: 'border-l-primary',
  income: 'border-l-income',
  expense: 'border-l-expense',
  debt: 'border-l-debt',
}

export function SidebarNav({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {sidebarLinks.map((item) => {
        const isActive = pathname === item.route || pathname.startsWith(item.route + '/')
        return (
          <Tooltip key={item.route} delayDuration={collapsed ? 0 : 700}>
            <TooltipTrigger asChild>
              <Link
                href={item.route}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 border-l-2 border-l-transparent',
                  isActive
                    ? cn('bg-sidebar-accent text-sidebar-accent-foreground', activeColorMap[item.color || 'primary'])
                    : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                  collapsed && 'justify-center px-2'
                )}
              >
                <div className={cn('flex items-center gap-3', collapsed && 'gap-0')}>
                  {!collapsed && (
                    <div className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      colorMap[item.color || 'primary']
                    )} />
                  )}
                  {item.icon}
                </div>
                {!collapsed && <span>{item.title}</span>}
              </Link>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">
                <p>{item.title}</p>
              </TooltipContent>
            )}
          </Tooltip>
        )
      })}
    </nav>
  )
}

const Sidebar = () => {
  const { user, signOut } = useAuth()
  const { collapsed, toggleCollapsed } = useSidebar()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.replace('/')
  }

  const userInitials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : 'U'

  return (
    <aside className={cn(
      'flex h-screen flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 max-sm:hidden',
      collapsed ? 'w-16' : 'w-60'
    )}>
      {/* Brand */}
      <div className={cn(
        'flex items-center gap-2 py-5 border-b border-sidebar-border',
        collapsed ? 'justify-center px-2' : 'px-6'
      )}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
          <span className="text-sm font-bold text-primary-foreground">D</span>
        </div>
        {!collapsed && <span className="text-lg font-semibold tracking-tight">DebtFlow</span>}
      </div>

      {/* Navigation */}
      <SidebarNav collapsed={collapsed} />

      {/* Collapse toggle */}
      <div className="px-3 py-2">
        <button
          onClick={toggleCollapsed}
          className={cn(
            'flex items-center gap-3 w-full rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all duration-200',
            collapsed && 'justify-center px-2'
          )}
          aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {collapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
          {!collapsed && <span>Colapsar</span>}
        </button>
      </div>

      {/* User section */}
      {user && (
        <div className={cn(
          'border-t border-sidebar-border px-3 py-4',
        )}>
          <div className={cn(
            'flex items-center gap-3 rounded-md px-3 py-2',
            collapsed && 'justify-center px-0'
          )}>
            <Tooltip delayDuration={collapsed ? 0 : 700}>
              <TooltipTrigger asChild>
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-muted text-xs font-medium">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right">
                  <p>{user.email}</p>
                </TooltipContent>
              )}
            </Tooltip>
            {!collapsed && (
              <>
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
              </>
            )}
          </div>
        </div>
      )}
    </aside>
  )
}

export default Sidebar
