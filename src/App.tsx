import * as React from 'react'
import { TitleBar } from '@/components/layout/TitleBar'
import { Sidebar } from '@/components/layout/Sidebar'
import { Toaster } from '@/components/ui/Toast'
import { DashboardPage } from '@/pages/DashboardPage'
import { OptimizePage } from '@/pages/OptimizePage'
import { ProfilesPage } from '@/pages/ProfilesPage'
import { MonitorPage } from '@/pages/MonitorPage'
import { CleanupPage } from '@/pages/CleanupPage'
import { ToolsPage } from '@/pages/ToolsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { Onboarding } from '@/components/onboarding/Onboarding'
import { useNavStore, useSystemStore, useSettingsStore, useOptimizationStore, useToastStore } from '@/store'
import { bridge } from '@/lib/bridge'

function PageContent() {
  const page = useNavStore((s) => s.page)

  switch (page) {
    case 'dashboard':
      return <DashboardPage />
    case 'optimize':
      return <OptimizePage />
    case 'profiles':
      return <ProfilesPage />
    case 'monitor':
      return <MonitorPage />
    case 'cleanup':
      return <CleanupPage />
    case 'tools':
      return <ToolsPage />
    case 'settings':
      return <SettingsPage />
    default:
      return <DashboardPage />
  }
}

export default function App() {
  const [collapsed, setCollapsed] = React.useState(false)
  const setInfo = useSystemStore((s) => s.setInfo)
  const setAdmin = useSystemStore((s) => s.setAdmin)
  const setLoaded = useSystemStore((s) => s.setLoaded)
  const theme = useSettingsStore((s) => s.settings.theme)
  const clearRestartFlags = useOptimizationStore((s) => s.clearRestartFlags)

  // Carrega info do sistema e status de admin
  React.useEffect(() => {
    const load = async () => {
      const [info, isAdmin] = await Promise.all([bridge.system.info(), bridge.system.isAdmin()])
      setInfo(info)
      setAdmin(isAdmin)
      setLoaded(true)

      if (!isAdmin) {
        useToastStore.getState().addToast({
          type: 'warning',
          title: 'Sem privilégios de administrador',
          message: 'Reinicie o WinGame Optimizer como administrador para aplicar todas as otimizações.',
          duration: 6000,
        })
      }

      // Detecta se o PC reiniciou desde a última execução e limpa as marcas de "requer reinício"
      try {
        const BOOT_KEY = 'wgo:bootTime'
        const prevBoot = localStorage.getItem(BOOT_KEY)
        if (info.bootTime && prevBoot && prevBoot !== info.bootTime) {
          clearRestartFlags()
          useToastStore.getState().addToast({
            type: 'success',
            title: 'Reinicialização detectada',
            message: 'As otimizações aplicadas foram concluídas após o reinício do Windows.',
          })
        }
        if (info.bootTime) localStorage.setItem(BOOT_KEY, info.bootTime)
      } catch {
        // ignore
      }
    }
    load()
  }, [setInfo, setAdmin, setLoaded, clearRestartFlags])

  // Aplica tema
  React.useEffect(() => {
    const root = document.documentElement
    const apply = (t: string) => {
      if (t === 'system') {
        const dark = window.matchMedia('(prefers-color-scheme: dark)').matches
        root.classList.toggle('light', !dark)
        root.classList.toggle('dark', dark)
      } else {
        root.classList.toggle('light', t === 'light')
        root.classList.toggle('dark', t === 'dark')
      }
    }
    apply(theme)
  }, [theme])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        <main className="relative flex-1 overflow-y-auto">
          <div className="grid-pattern pointer-events-none absolute inset-0" aria-hidden="true" />
          <div className="relative mx-auto max-w-6xl px-6 py-6">
            <PageContent />
          </div>
        </main>
      </div>
      <Toaster />
      <Onboarding />
    </div>
  )
}