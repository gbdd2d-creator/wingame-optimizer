import * as React from 'react'
import { Minus, Square, X, Zap } from 'lucide-react'
import { bridge } from '@/lib/bridge'
import { cn } from '@/lib/utils'
import { useSystemStore } from '@/store'

export function TitleBar() {
  const [maximized, setMaximized] = React.useState(false)
  const { isAdmin } = useSystemStore()

  React.useEffect(() => {
    bridge.window.isMaximized().then(setMaximized)
    const unsub = bridge.window.onMaximized(setMaximized)
    return unsub
  }, [])

  return (
    <header className="titlebar-drag relative z-30 flex h-12 shrink-0 items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Zap className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold tracking-tight">WinGame Optimizer</span>
        </div>
        <span className="hidden items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground md:inline-flex">
          <span
            className={cn('h-1.5 w-1.5 rounded-full', isAdmin ? 'bg-success' : 'bg-warning')}
            aria-hidden="true"
          />
          {isAdmin ? 'Administrador' : 'Sem privilégios admin'}
        </span>
      </div>

      <div className="titlebar-no-drag flex items-center gap-1">
        <button
          onClick={() => bridge.window.minimize()}
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Minimizar"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          onClick={() => bridge.window.maximize()}
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label={maximized ? 'Restaurar' : 'Maximizar'}
        >
          <Square className={cn('h-3.5 w-3.5', maximized && 'scale-90')} />
        </button>
        <button
          onClick={() => bridge.window.close()}
          className="ml-1 rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}