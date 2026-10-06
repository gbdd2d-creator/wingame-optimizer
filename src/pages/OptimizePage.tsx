import * as React from 'react'
import {
  Cpu,
  Wifi,
  MonitorPlay,
  Zap,
  Trash2,
  Server,
  HardDrive,
  ShieldCheck,
  Play,
  RotateCcw,
  ShieldAlert,
  Info,
  ChevronDown,
  Check,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useNavStore, useOptimizationStore, useProfileStore, useToastStore, useSystemStore, useSettingsStore } from '@/store'
import { categories, optimizations, getCategory } from '@/data/optimizations'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'
import type { OptimizationItem } from '@/types'

const categoryIcons: Record<string, React.ReactNode> = {
  system: <Cpu className="h-5 w-5" />,
  network: <Wifi className="h-5 w-5" />,
  gpu: <MonitorPlay className="h-5 w-5" />,
  power: <Zap className="h-5 w-5" />,
  debloat: <Trash2 className="h-5 w-5" />,
  services: <Server className="h-5 w-5" />,
  storage: <HardDrive className="h-5 w-5" />,
  privacy: <ShieldCheck className="h-5 w-5" />,
}

const riskConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive'; desc: string }> = {
  low: { label: 'Baixo risco', variant: 'success', desc: 'Alteração segura, fácil de reverter.' },
  medium: { label: 'Risco médio', variant: 'warning', desc: 'Alteração que pode afetar o sistema; reversível.' },
  high: { label: 'Alto risco', variant: 'destructive', desc: 'Alteração que pode exigir reinstalação manual. Cuidado!' },
}

const impactConfig: Record<string, { label: string; variant: 'info' | 'warning' | 'destructive' }> = {
  low: { label: 'Baixo impacto', variant: 'info' },
  medium: { label: 'Médio impacto', variant: 'warning' },
  high: { label: 'Alto impacto', variant: 'destructive' },
}

const vendorConfig: Record<string, { label: string; className: string }> = {
  nvidia: { label: 'NVIDIA', className: 'border-[#76B900]/30 bg-[#76B900]/10 text-[#76B900]' },
  amd: { label: 'AMD', className: 'border-red-500/30 bg-red-500/10 text-red-400' },
  intel: { label: 'Intel', className: 'border-sky-500/30 bg-sky-500/10 text-sky-400' },
}

function OptimizationCardView({ item }: { item: OptimizationItem }) {
  const { results, isApplying, applyingId, apply, revert, reset } = useOptimizationStore()
  const toast = useToast()
  const result = results[item.id]
  const isBusy = isApplying && applyingId === item.id

  const handleApply = async () => {
    const r = await apply(item)
    if (r.success) {
      toast.success('Otimização aplicada', `${item.title}${item.requiresRestart ? ' — reinicie o PC para aplicar completamente.' : ''}`)
      if (item.requiresRestart) {
        useToastStore.getState().addToast({
          type: 'warning',
          title: 'Reinicialização recomendada',
          message: 'Para que esta otimização tenha efeito total, reinicie o Windows.',
        })
      }
    } else {
      toast.error('Falha ao aplicar', r.message)
    }
  }

  const handleRevert = async () => {
    const r = await revert(item)
    if (r.success) {
      toast.success('Otimização revertida', item.title)
    } else {
      toast.error('Falha ao reverter', r.message)
    }
  }

  const risk = riskConfig[item.risk]
  const impact = impactConfig[item.impact]

  return (
    <Card className={cn('card-hover', result?.success && 'border-success/30')}>
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {categoryIcons[item.category]}
              </span>
              <h3 className="text-sm font-semibold text-card-foreground">{item.title}</h3>
              {result?.success && (
                <Badge variant="success" dot>
                  <Check className="h-3 w-3" /> Aplicada
                </Badge>
              )}
            </div>

            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant={risk.variant} dot title={risk.desc}>{risk.label}</Badge>
              <Badge variant={impact.variant} dot>Impacto: {impact.label}</Badge>
              {item.vendor && vendorConfig[item.vendor] && (
                <Badge variant="outline" className={vendorConfig[item.vendor].className}>
                  {vendorConfig[item.vendor].label}
                </Badge>
              )}
              {item.requiresAdmin && <Badge variant="outline">Requer admin</Badge>}
              {item.requiresRestart && <Badge variant="outline">Requer reinício</Badge>}
              {item.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-muted-foreground/80">#{tag}</Badge>
              ))}
            </div>

            {result && !result.success && (
              <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                {result.message}
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-stretch">
            {result?.success ? (
              <Button variant="outline" size="sm" onClick={handleRevert} disabled={isBusy} leftIcon={<RotateCcw className="h-3.5 w-3.5" />}>
                Reverter
              </Button>
            ) : (
              <Button size="sm" onClick={handleApply} disabled={isBusy} loading={isBusy} leftIcon={<Play className="h-3.5 w-3.5" />}>
                Aplicar
              </Button>
            )}
            {result?.success && (
              <Button variant="ghost" size="sm" onClick={() => reset(item.id)}>
                Limpar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function OptimizePage() {
  const { category, setCategory } = useNavStore()
  const { results, setItems } = useOptimizationStore()
  const { activeProfile } = useProfileStore()
  const { info } = useSystemStore()
  const { settings } = useSettingsStore()
  const [showAllVendor, setShowAllVendor] = React.useState(false)

  React.useEffect(() => {
    setItems(optimizations)
  }, [setItems])

  const detectedVendor = info?.gpuVendor
  const effectiveVendor = settings.gpuVendorPref === 'auto' ? detectedVendor : settings.gpuVendorPref

  const visibleItems = React.useMemo(() => {
    let items = category === 'all' ? optimizations : optimizations.filter((o) => o.category === category)
    if (!showAllVendor && effectiveVendor && effectiveVendor !== 'other') {
      items = items.filter((o) => !o.vendor || o.vendor === effectiveVendor)
    }
    return items
  }, [category, showAllVendor, effectiveVendor])

  const hasVendorSpecific = optimizations.some((o) => o.vendor)

  const appliedCount = Object.values(results).filter((r) => r.success).length
  const activeProfileName = activeProfile ? getProfileName(activeProfile) : null

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">Otimizações</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cada otimização explica o que faz no seu computador. Aplique com confiança — todas possuem reversão.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeProfile && (
            <Badge variant="success" dot>
              Perfil: {activeProfileName}
            </Badge>
          )}
          <Badge variant="info">
            {appliedCount} aplicadas
          </Badge>
        </div>
      </div>

      {/* Categorias */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategory('all')}
          className={cn(
            'rounded-lg border px-3.5 py-2 text-xs font-medium transition-all',
            category === 'all'
              ? 'border-primary/50 bg-primary text-primary-foreground'
              : 'border-border bg-card/50 text-muted-foreground hover:border-primary/30 hover:text-foreground'
          )}
        >
          Todas ({optimizations.length})
        </button>
        {categories.map((cat) => {
          const count = optimizations.filter((o) => o.category === cat.id).length
          const active = category === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => setCategory(active ? 'all' : cat.id)}
              className={cn(
                'flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium transition-all',
                active
                  ? 'border-primary/50 bg-primary text-primary-foreground'
                  : 'border-border bg-card/50 text-muted-foreground hover:border-primary/30 hover:text-foreground'
              )}
            >
              <span className={cn(active ? 'text-primary-foreground' : 'text-primary')}>{categoryIcons[cat.id]}</span>
              {cat.label}
              <span className={cn('tabular-nums', active ? 'text-primary-foreground/80' : 'text-muted-foreground')}>{count}</span>
            </button>
          )
        })}
      </div>

      {/* Filtro por GPU */}
      {hasVendorSpecific && (
        <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MonitorPlay className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">
                {settings.gpuVendorPref !== 'auto'
                  ? `Placa configurada: ${vendorConfig[effectiveVendor ?? 'nvidia']?.label ?? '—'}`
                  : detectedVendor && detectedVendor !== 'other'
                    ? `Sua GPU: ${info?.gpuName || 'detectada'}`
                    : 'GPU não identificada'}
              </p>
              <p className="text-xs text-muted-foreground">
                Algumas otimizações são específicas para NVIDIA ou AMD. Você pode escolher a marca na aba Perfis ou
                Configurações.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAllVendor((v) => !v)}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium transition-all',
              showAllVendor
                ? 'border-primary/50 bg-primary text-primary-foreground'
                : 'border-border bg-background/40 text-muted-foreground hover:border-primary/30 hover:text-foreground'
            )}
          >
            <span
              className={cn(
                'flex h-4 w-7 items-center rounded-full p-0.5 transition-colors',
                showAllVendor ? 'bg-primary' : 'bg-muted'
              )}
            >
              <span
                className={cn(
                  'h-3 w-3 rounded-full bg-card transition-transform',
                  showAllVendor ? 'translate-x-3' : 'translate-x-0'
                )}
              />
            </span>
            Mostrar todas as GPUs
          </button>
        </div>
      )}

      {/* Descrição da categoria */}
      {category !== 'all' && (
        <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/50 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {categoryIcons[category]}
          </span>
          <div>
            <p className="text-sm font-semibold">{getCategory(category).label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{getCategory(category).description}</p>
          </div>
        </div>
      )}

      {/* Lista */}
      {visibleItems.length === 0 ? (
        <Card className="p-10 text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 font-semibold text-card-foreground">Nenhuma otimização encontrada</p>
          <p className="text-sm text-muted-foreground">Esta categoria não possui otimizações disponíveis.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {visibleItems.map((item) => (
            <OptimizationCardView key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Aviso */}
      <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        <div className="text-xs text-warning">
          <p className="font-semibold">Recomendações de segurança</p>
          <p className="mt-1">
            Crie um ponto de restauração antes de aplicar otimizações (use a aba Ferramentas). Todas as otimizações são
            reversíveis, mas reiniciar o PC após aplicar é recomendado para efeito completo.
          </p>
        </div>
      </div>
    </div>
  )
}

function getProfileName(profile: string): string {
  const map: Record<string, string> = {
    competitive: 'Competitivo',
    casual: 'Casual',
    streaming: 'Streaming',
  }
  return map[profile] ?? profile
}