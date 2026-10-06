import * as React from 'react'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToastStore } from '@/store'

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const styles = {
  success: 'border-success/30 text-success',
  error: 'border-destructive/30 text-destructive',
  warning: 'border-warning/30 text-warning',
  info: 'border-primary/30 text-primary',
}

export function Toaster() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div
      className="pointer-events-none fixed bottom-6 right-6 z-[100] flex w-full max-w-sm flex-col gap-3"
      aria-live="polite"
      aria-label="Notificações"
    >
      {toasts.map((toast) => {
        const Icon = icons[toast.type]
        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-xl border bg-card/95 p-4 shadow-elevation-3 backdrop-blur-xl animate-slide-in-right',
              styles[toast.type]
            )}
            role="status"
          >
            <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-card-foreground">{toast.title}</p>
              {toast.message && (
                <p className="mt-0.5 text-xs text-muted-foreground">{toast.message}</p>
              )}
              {toast.action && (
                <button
                  onClick={() => {
                    toast.action!.onClick()
                    removeToast(toast.id)
                  }}
                  className="mt-2 text-xs font-medium text-primary hover:underline"
                >
                  {toast.action.label}
                </button>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Fechar notificação"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export function useToast() {
  const addToast = useToastStore((s) => s.addToast)
  return React.useMemo(
    () => ({
      success: (title: string, message?: string) => addToast({ type: 'success', title, message }),
      error: (title: string, message?: string) => addToast({ type: 'error', title, message }),
      warning: (title: string, message?: string) => addToast({ type: 'warning', title, message }),
      info: (title: string, message?: string) => addToast({ type: 'info', title, message }),
      dismiss: (id: string) => useToastStore.getState().removeToast(id),
    }),
    [addToast]
  )
}