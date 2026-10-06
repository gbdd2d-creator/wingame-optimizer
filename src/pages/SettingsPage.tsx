import * as React from 'react'
import {
  Settings,
  ShieldCheck,
  MonitorCog,
  Moon,
  Sun,
  Monitor,
  Zap,
  Info,
  ExternalLink,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { ToggleRow } from '@/components/ui/Switch'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { GpuSelector } from '@/components/ui/GpuSelector'
import { useSettingsStore, useSystemStore, useOptimizationStore } from '@/store'
import { useToast } from '@/components/ui/Toast'
import { bridge } from '@/lib/bridge'
import { formatBytes } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { SystemInfo } from '@/types'

const themes = [
  { id: 'dark', label: 'Escuro', icon: <Moon className="h-5 w-5" /> },
  { id: 'light', label: 'Claro', icon: <Sun className="h-5 w-5" /> },
  { id: 'system', label: 'Sistema', icon: <Monitor className="h-5 w-5" /> },
] as const

export function SettingsPage() {
  const { settings, setSettings } = useSettingsStore()
  const { info, isAdmin } = useSystemStore()
  const { clearResults, results } = useOptimizationStore()
  const toast = useToast()

  const applyTheme = (theme: 'dark' | 'light' | 'system') => {
    setSettings({ theme })
    const root = document.documentElement
    if (theme === 'system') {
      const dark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('light', !dark)
      root.classList.toggle('dark', dark)
    } else {
      root.classList.toggle('light', theme === 'light')
      root.classList.toggle('dark', theme === 'dark')
    }
  }

  React.useEffect(() => {
    applyTheme(settings.theme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRequestAdmin = async () => {
    const res = await bridge.system.requestAdmin()
    if (res.success) {
      toast.info('Elevação solicitada', 'Aceite o prompt do UAC para continuar como administrador.')
    } else {
      toast.error('Falha ao elevar privilégios', res.error ?? undefined)
    }
  }

  const clearAll = () => {
    clearResults()
    toast.success('Histórico limpo', 'Todas as otimizações foram marcadas como não aplicadas.')
  }

  const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-card-foreground">{value}</span>
    </div>
  )

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-xl font-bold tracking-tight md:text-2xl">Configurações</h1>
        <p className="mt-1 text-sm text-muted-foreground">Personalize o WinGame Optimizer ao seu gosto.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Aparência */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MonitorCog className="h-5 w-5 text-primary" />
              Aparência
            </CardTitle>
            <CardDescription>Escolha o tema da interface</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {themes.map((t) => {
                const active = settings.theme === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => applyTheme(t.id)}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-xl border p-4 transition-all',
                      active
                        ? 'border-primary/50 bg-primary/10 text-primary'
                        : 'border-border/60 text-muted-foreground hover:border-primary/25 hover:text-foreground'
                    )}
                  >
                    {t.icon}
                    <span className="text-xs font-medium">{t.label}</span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Preferências */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Preferências
            </CardTitle>
            <CardDescription>Ajustes de comportamento do aplicativo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <ToggleRow
              label="Criar backup automático"
              description="Cria um ponto de restauração antes de aplicar otimizações"
              checked={settings.autoBackup}
              onChange={(v) => setSettings({ autoBackup: v })}
            />
            <ToggleRow
              label="Notificações"
              description="Mostrar notificações ao concluir ações"
              checked={settings.showNotifications}
              onChange={(v) => setSettings({ showNotifications: v })}
            />
            <div className="pt-1">
              <p className="text-sm font-medium text-card-foreground">Placa de vídeo</p>
              <p className="mb-3 text-xs text-muted-foreground">
                Usada para ativar as otimizações específicas da marca da sua GPU
              </p>
              <GpuSelector />
            </div>
          </CardContent>
        </Card>

        {/* Privilégios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Privilégios do sistema
            </CardTitle>
            <CardDescription>
              Algumas otimizações exigem privilégios de administrador
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background/30 p-4">
              <div>
                <p className="text-sm font-medium text-card-foreground">Status atual</p>
                <p className="text-xs text-muted-foreground">
                  {isAdmin ? 'Executando como administrador' : 'Executando sem privilégios de admin'}
                </p>
              </div>
              <Badge variant={isAdmin ? 'success' : 'warning'} dot>
                {isAdmin ? 'Administrador' : 'Limitado'}
              </Badge>
            </div>
            {!isAdmin && (
              <Button fullWidth onClick={handleRequestAdmin} leftIcon={<ShieldCheck className="h-4 w-4" />}>
                Reiniciar como administrador
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              Para aplicar todas as otimizações, reinicie o aplicativo como administrador (clique com o botão direito →
              "Executar como administrador").
            </p>
          </CardContent>
        </Card>

        {/* Sobre o sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Sobre o sistema
            </CardTitle>
            <CardDescription>Informações do hardware deste computador</CardDescription>
          </CardHeader>
          <CardContent>
            {info ? (
              <div className="divide-y divide-border/40">
                <Row label="Sistema operacional" value={`${info.osName} ${info.osVersion}`} />
                <Row label="Build" value={info.osBuild} />
                <Row label="Processador" value={info.cpuName.split('@')[0].trim()} />
                <Row label="Núcleos" value={`${info.cpuCores} cores / ${info.cpuThreads} threads`} />
                <Row label="GPU" value={info.gpuName} />
                <Row label="Memória RAM" value={formatBytes(info.ramTotal)} />
                {info.disks?.length ? (
                  info.disks.map((d) => (
                    <Row
                      key={d.device}
                      label={`Disco ${d.device}:${d.label ? ` (${d.label})` : ''}`}
                      value={`${formatBytes(d.size)} · ${Math.round(d.usage)}% em uso · ${formatBytes(d.free)} livres`}
                    />
                  ))
                ) : (
                  <Row label="Disco (C:)" value={formatBytes(info.diskTotal)} />
                )}
                <Row label="Arquitetura" value={info.architecture} />
              </div>
            ) : (
              <div className="h-48 animate-pulse rounded-xl bg-muted/40" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Zona de perigo */}
      <Card className="border-destructive/25">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Zap className="h-5 w-5" />
            Zona de perigo
          </CardTitle>
          <CardDescription>Ações destrutivas que não podem ser desfeitas</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button variant="destructive" onClick={clearAll} disabled={Object.keys(results).length === 0}>
            Limpar histórico de otimizações
          </Button>
        </CardContent>
      </Card>

      {/* Sobre o app */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Sobre o app
          </CardTitle>
          <CardDescription>Informações e ajuda do WinGame Optimizer</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => window.dispatchEvent(new Event('wgo:open-onboarding'))}
            leftIcon={<Info className="h-4 w-4" />}
          >
            Ver tutorial novamente
          </Button>
          <Button
            variant="outline"
            onClick={() => bridge.openExternal('https://github.com')}
            leftIcon={<ExternalLink className="h-4 w-4" />}
          >
            Repositório do projeto
          </Button>
        </CardContent>
      </Card>

      <p className="pb-4 text-center text-xs text-muted-foreground">
        WinGame Optimizer v1.0.0 • Criado por <span className="font-semibold text-primary">Double'D code</span> com ♥ para gamers
      </p>
    </div>
  )
}