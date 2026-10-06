import * as React from 'react'
import {
  Cpu,
  MemoryStick,
  Monitor,
  HardDrive,
  ShieldCheck,
  Zap,
  TrendingUp,
  Gauge,
  ArrowRight,
  Sparkles,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useSystemStore, useNavStore, useOptimizationStore, useProfileStore, useSettingsStore } from '@/store'
import { useToast } from '@/components/ui/Toast'
import { optimizations, profiles } from '@/data/optimizations'
import { formatBytes } from '@/lib/utils'
import { bridge } from '@/lib/bridge'
import type { OptimizationProfile } from '@/types'

export function DashboardPage() {
  const { info, isAdmin } = useSystemStore()
  const { setPage, setCategory } = useNavStore()
  const { results } = useOptimizationStore()
  const { activeProfile, setActiveProfile } = useProfileStore()
  const { settings } = useSettingsStore()
  const toast = useToast()

  const handleRequestAdmin = async () => {
    const res = await bridge.system.requestAdmin()
    if (res.success) {
      toast.info('Elevação solicitada', 'Aceite o prompt do UAC para reiniciar como administrador.')
    } else {
      toast.error('Falha ao elevar privilégios', res.error ?? 'Não foi possível reiniciar como administrador.')
    }
  }

  const totalItems = optimizations.length
  const appliedCount = Object.values(results).filter((r) => r.success).length
  const healthScore = Math.round((appliedCount / totalItems) * 100)

  const appliedIds = new Set(Object.keys(results).filter((id) => results[id].success))
  const pendingCount = optimizations.filter((o) => !appliedIds.has(o.id)).length

  const restartNeeded = optimizations.some((o) => appliedIds.has(o.id) && results[o.id].requiresRestart)

  const stats = [
    {
      label: 'Otimizações aplicadas',
      value: `${appliedCount}`,
      sub: `de ${totalItems} disponíveis`,
      icon: <Zap className="h-5 w-5" />,
      color: 'text-primary bg-primary/10',
      onClick: () => setPage('optimize'),
    },
    {
      label: 'Pendentes',
      value: `${pendingCount}`,
      sub: 'otimizações recomendadas',
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'text-warning bg-warning/10',
      onClick: () => setPage('optimize'),
    },
    {
      label: 'Saúde do sistema',
      value: `${healthScore}%`,
      sub: healthScore > 70 ? 'Excelente' : healthScore > 40 ? 'Boa' : 'Requer otimização',
      icon: <Gauge className="h-5 w-5" />,
      color: 'text-success bg-success/10',
      onClick: () => setPage('optimize'),
    },
  ]

  const systemInfoCards = info
    ? [
        { label: 'Sistema', value: `${info.osName} ${info.osVersion}`, sub: `Build ${info.osBuild}`, icon: <Cpu className="h-4 w-4" /> },
        { label: 'Processador', value: info.cpuName.split('@')[0].trim(), sub: `${info.cpuCores} núcleos / ${info.cpuThreads} threads`, icon: <Cpu className="h-4 w-4" /> },
        { label: 'Memória RAM', value: formatBytes(info.ramTotal), sub: `${Math.round(info.ramUsage)}% em uso`, icon: <MemoryStick className="h-4 w-4" /> },
        { label: 'GPU', value: info.gpuName, sub: 'Adaptador de vídeo', icon: <Monitor className="h-4 w-4" /> },
        ...(info.disks?.length
          ? info.disks.map((d) => ({
              label: `Disco ${d.device}:${d.label ? ` (${d.label})` : ''}`,
              value: formatBytes(d.size),
              sub: `${Math.round(d.usage)}% em uso · ${formatBytes(d.free)} livres`,
              icon: <HardDrive className="h-4 w-4" />,
            }))
          : [{ label: 'Disco (C:)', value: formatBytes(info.diskTotal), sub: `${Math.round(info.diskUsage)}% em uso`, icon: <HardDrive className="h-4 w-4" /> }]),
      ]
    : []

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Aviso de administrador */}
      {!isAdmin && (
        <div className="flex flex-col gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
            <div className="text-warning">
              <p className="text-sm font-semibold">Você está sem privilégios de administrador</p>
              <p className="mt-0.5 text-xs text-warning/90">
                Algumas otimizações marcadas como "Requer admin" só funcionam como administrador. Reinicie o aplicativo
                elevado para poder aplicar todas.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={handleRequestAdmin}
            leftIcon={<ShieldCheck className="h-4 w-4" />}
          >
            Reiniciar como administrador
          </Button>
        </div>
      )}

      {/* Hero */}
      <div className="gradient-border relative overflow-hidden rounded-2xl border border-border/60 bg-card/70 p-6 backdrop-blur-xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" aria-hidden="true" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <div className="mb-3 flex items-center gap-2">
              <Badge variant="primary" dot>
                {isAdmin ? 'Rodando como administrador' : 'Sem privilégios de admin'}
              </Badge>
              {activeProfile && (
                <Badge variant="success">
                  Perfil: {profiles.find((p) => p.id === activeProfile)?.name}
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Bem-vindo de volta! <span className="gradient-text">Otimize seu PC agora</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {pendingCount === 0
                ? 'Todas as otimizações recomendadas foram aplicadas. Seu PC está em sua melhor forma!'
                : `Você tem ${pendingCount} otimizações pendentes que podem melhorar sua performance em jogos.`}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button onClick={() => setPage('optimize')} leftIcon={<Zap className="h-4 w-4" />}>
                Ver otimizações
              </Button>
              <Button variant="outline" onClick={() => setPage('monitor')} leftIcon={<Gauge className="h-4 w-4" />}>
                Abrir monitor
              </Button>
            </div>
          </div>

          {/* Score */}
          <div className="flex items-center gap-4 rounded-2xl border border-border/50 bg-background/40 p-5">
            <div className="relative flex h-24 w-24 items-center justify-center">
              <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(healthScore / 100) * 264} 264`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute text-center">
                <p className="text-2xl font-bold tabular-nums">{healthScore}%</p>
                <p className="text-[10px] text-muted-foreground">otimizado</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">Índice de otimização</p>
              <p className="text-xs text-muted-foreground">
                {healthScore > 70 ? 'Seu PC está voando!' : healthScore > 40 ? 'Bom caminho, continue!' : 'Aplique otimizações para melhorar.'}
              </p>
              {restartNeeded && (
                <p className="flex items-center gap-1 text-xs font-medium text-warning">
                  <AlertTriangle className="h-3.5 w-3.5" /> Reinicialização pendente
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <button
            key={stat.label}
            onClick={stat.onClick}
            className="group rounded-xl border border-border/60 bg-card/70 p-5 text-left transition-all duration-300 hover:border-primary/30 hover:shadow-elevation-3"
          >
            <div className="flex items-center justify-between">
              <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                {stat.icon}
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </div>
            <p className="mt-3 text-2xl font-bold tabular-nums">{stat.value}</p>
            <p className="text-sm font-medium text-foreground">{stat.label}</p>
            <p className="text-xs text-muted-foreground">{stat.sub}</p>
          </button>
        ))}
      </div>

      {/* Sistema */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Informações do sistema
            </CardTitle>
            <CardDescription>Detalhes do hardware e do sistema operacional</CardDescription>
          </div>
          {!info && <Badge variant="warning" dot>Carregando...</Badge>}
        </CardHeader>
        <CardContent>
          {info ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {systemInfoCards.map((card) => (
                <div key={card.label} className="rounded-xl border border-border/40 bg-background/30 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-primary">{card.icon}</span>
                    <span className="text-xs font-medium uppercase tracking-wide">{card.label}</span>
                  </div>
                  <p className="mt-2 truncate text-sm font-semibold text-card-foreground" title={card.value}>
                    {card.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{card.sub}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-muted/40" />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Perfis rápidos */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Perfis de otimização
            </CardTitle>
            <CardDescription>Escolha um perfil para aplicar um conjunto de otimizações focado no seu uso</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {profiles.map((profile) => {
              const effectiveVendor = settings.gpuVendorPref === 'auto' ? info?.gpuVendor : settings.gpuVendorPref
              const compatible = optimizations.filter(
                (o) =>
                  o.profiles.includes(profile.id) &&
                  (!o.vendor || !effectiveVendor || effectiveVendor === 'other' || o.vendor === effectiveVendor)
              )
              const count = compatible.length
              const applied = compatible.filter((o) => appliedIds.has(o.id)).length
              const active = activeProfile === profile.id
              return (
                <button
                  key={profile.id}
                  onClick={() => setActiveProfile(active ? null : (profile.id as OptimizationProfile))}
                  className={`rounded-xl border p-5 text-left transition-all duration-300 ${
                    active
                      ? 'border-primary/40 bg-primary/10 shadow-glow'
                      : 'border-border/60 bg-card/70 hover:border-primary/25 hover:shadow-elevation-2'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <Zap className="h-5 w-5" />
                    </span>
                    {active && <Badge variant="primary" dot>Ativo</Badge>}
                  </div>
                  <p className="mt-3 font-semibold text-card-foreground">{profile.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{profile.description}</p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{count} otimizações</span>
                    <span className="tabular-nums text-muted-foreground">{applied}/{count} aplicadas</span>
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}