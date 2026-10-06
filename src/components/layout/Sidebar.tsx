import * as React from 'react'
import {
  LayoutDashboard,
  Zap,
  Users,
  Activity,
  Wrench,
  Settings,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Wifi,
  MonitorPlay,
  Zap as ZapIcon,
  Trash2,
  Server,
  HardDrive,
  ShieldCheck,
  Eraser,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNavStore, type PageId } from '@/store'
import { categories, profiles } from '@/data/optimizations'
import { useProfileStore } from '@/store'
import type { OptimizationCategory } from '@/types'

const iconMap: Record<string, React.ReactNode> = {
  Cpu: <Cpu className="h-4.5 w-4.5" />,
  Wifi: <Wifi className="h-4.5 w-4.5" />,
  MonitorPlay: <MonitorPlay className="h-4.5 w-4.5" />,
  Zap: <ZapIcon className="h-4.5 w-4.5" />,
  Trash2: <Trash2 className="h-4.5 w-4.5" />,
  Server: <Server className="h-4.5 w-4.5" />,
  HardDrive: <HardDrive className="h-4.5 w-4.5" />,
  ShieldCheck: <ShieldCheck className="h-4.5 w-4.5" />,
}

const profileIconMap: Record<string, React.ReactNode> = {
  Target: <Zap className="h-4 w-4" />,
  Gamepad2: <Zap className="h-4 w-4" />,
  Radio: <Zap className="h-4 w-4" />,
}

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { page, setPage, category, setCategory } = useNavStore()
  const { activeProfile, setActiveProfile } = useProfileStore()

  const navItems: { id: PageId; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Painel', icon: <LayoutDashboard className="h-4.5 w-4.5" /> },
    { id: 'optimize', label: 'Otimizações', icon: <Zap className="h-4.5 w-4.5" /> },
    { id: 'profiles', label: 'Perfis', icon: <Users className="h-4.5 w-4.5" /> },
    { id: 'monitor', label: 'Monitor', icon: <Activity className="h-4.5 w-4.5" /> },
    { id: 'cleanup', label: 'Limpeza', icon: <Eraser className="h-4.5 w-4.5" /> },
    { id: 'tools', label: 'Ferramentas', icon: <Wrench className="h-4.5 w-4.5" /> },
    { id: 'settings', label: 'Configurações', icon: <Settings className="h-4.5 w-4.5" /> },
  ]

  const handleNav = (id: PageId) => {
    setPage(id)
    if (id === 'optimize' && category === 'all') {
      // mantém categoria atual
    }
  }

  return (
    <aside
      className={cn(
        'relative z-20 flex shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn('flex h-14 items-center border-b border-sidebar-border px-4', collapsed && 'justify-center px-0')}>
        {collapsed ? (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="h-4 w-4" />
          </span>
        ) : (
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold leading-tight">WinGame</p>
              <p className="text-[10px] font-medium text-muted-foreground">Optimizer</p>
            </div>
          </div>
        )}
      </div>

      {/* Nav principal */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        <p className={cn('px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70', collapsed && 'px-0 text-center')}>
          {collapsed ? '•••' : 'Menu'}
        </p>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNav(item.id)}
            className={cn('sidebar-link', page === item.id && 'sidebar-link-active', collapsed && 'justify-center px-0')}
            title={collapsed ? item.label : undefined}
            aria-current={page === item.id ? 'page' : undefined}
          >
            <span aria-hidden="true">{item.icon}</span>
            {!collapsed && <span className="truncate">{item.label}</span>}
          </button>
        ))}

        {/* Categorias */}
        {page === 'optimize' && (
          <div className="mt-4 animate-fade-in">
            <p className={cn('px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70', collapsed && 'px-0 text-center')}>
              {collapsed ? '•••' : 'Categorias'}
            </p>
            {categories.map((cat) => {
              const active = category === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCategory(active ? 'all' : (cat.id as OptimizationCategory))
                    setPage('optimize')
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-all duration-200 hover:bg-sidebar-accent',
                    active && 'bg-primary/15 text-primary',
                    collapsed && 'justify-center px-0'
                  )}
                  title={collapsed ? cat.label : undefined}
                >
                  <span aria-hidden="true" className={cn('opacity-80', active && 'opacity-100')}>
                    {iconMap[cat.icon]}
                  </span>
                  {!collapsed && <span className="truncate">{cat.label}</span>}
                  {!collapsed && active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
                </button>
              )
            })}
          </div>
        )}
      </nav>

      {/* Perfil ativo */}
      <div className="border-t border-sidebar-border p-3">
        {collapsed ? (
          <button
            onClick={() => setPage('profiles')}
            className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary transition-colors hover:bg-primary/25"
            title="Perfis"
          >
            <Users className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={() => setPage('profiles')}
            className="flex w-full items-center gap-3 rounded-xl border border-border/50 bg-sidebar-accent/50 p-2.5 text-left transition-colors hover:border-primary/30"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
              {activeProfile ? profileIconMap[profiles.find((p) => p.id === activeProfile)?.icon ?? ''] ?? <Users className="h-4 w-4" /> : <Users className="h-4 w-4" />}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-xs font-semibold text-sidebar-foreground">
                {activeProfile ? profiles.find((p) => p.id === activeProfile)?.name : 'Nenhum perfil'}
              </span>
              <span className="block truncate text-[10px] text-muted-foreground">Gerenciar perfis</span>
            </span>
          </button>
        )}
      </div>

      {/* Créditos */}
      <div className="border-t border-sidebar-border px-3 py-2.5">
        {collapsed ? (
          <p className="text-center text-[9px] font-medium text-muted-foreground/60" title="Criado por Double'D code">
            DD
          </p>
        ) : (
          <p className="text-center text-[10px] leading-relaxed text-muted-foreground/70">
            Criado por <span className="font-semibold text-primary">Double'D code</span>
          </p>
        )}
      </div>

      {/* Colapso */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-16 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-elevation-2 transition-colors hover:text-foreground"
        aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>
    </aside>
  )
}