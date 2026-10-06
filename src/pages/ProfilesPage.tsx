import * as React from 'react'
import { Zap, Check, Play, RotateCcw, RefreshCw, Target, Gamepad2, Radio, ArrowRight, MonitorPlay } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { GpuSelector } from '@/components/ui/GpuSelector'
import { useProfileStore, useOptimizationStore, useNavStore, useToastStore, useSystemStore, useSettingsStore } from '@/store'
import { profiles, optimizations } from '@/data/optimizations'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'
import { isElectron } from '@/lib/utils'
import { bridge } from '@/lib/bridge'
import type { OptimizationProfile, OptimizationItem } from '@/types'

const profileIcons: Record<string, React.ReactNode> = {
  competitive: <Target className="h-6 w-6" />,
  casual: <Gamepad2 className="h-6 w-6" />,
  streaming: <Radio className="h-6 w-6" />,
}

export function ProfilesPage() {
  const { activeProfile, setActiveProfile } = useProfileStore()
  const { results, apply, isApplying, applyingId } = useOptimizationStore()
  const { setPage, setCategory } = useNavStore()
  const { info } = useSystemStore()
  const { settings } = useSettingsStore()
  const toast = useToast()

  const detectedVendor = info?.gpuVendor
  const effectiveVendor = settings.gpuVendorPref === 'auto' ? detectedVendor : settings.gpuVendorPref

  const isVendorCompatible = (item: OptimizationItem) => !item.vendor || !effectiveVendor || effectiveVendor === 'other' || item.vendor === effectiveVendor

  const appliedIds = new Set(Object.keys(results).filter((id) => results[id].success))

  const applyAllForProfile = async (profileId: OptimizationProfile) => {
    const items = optimizations.filter((o) => o.profiles.includes(profileId) && isVendorCompatible(o))
    const pending = items.filter((o) => !appliedIds.has(o.id))

    if (pending.length === 0) {
      toast.info('Perfil já aplicado', 'Todas as otimizações deste perfil já estão ativas.')
      return
    }

    toast.info('Aplicando perfil', `Aplicando ${pending.length} otimizações...`)

    let success = 0
    for (const item of pending) {
      const r = await apply(item)
      if (r.success) success++
    }

    if (success === pending.length) {
      toast.success('Perfil aplicado com sucesso', `${success} otimizações ativadas.`)
    } else {
      toast.warning('Perfil parcialmente aplicado', `${success} de ${pending.length} otimizações aplicadas.`)
    }
  }

  const revertAllForProfile = async (profileId: OptimizationProfile) => {
    const items = optimizations.filter((o) => o.profiles.includes(profileId) && appliedIds.has(o.id))
    if (items.length === 0) {
      toast.info('Nada para reverter', 'Nenhuma otimização deste perfil está aplicada.')
      return
    }
    toast.info('Revertendo perfil', `Revertendo ${items.length} otimizações...`)
    let reverted = 0
    for (const item of items) {
      if (!item.revertCommand) {
        useOptimizationStore.getState().reset(item.id)
        reverted++
        continue
      }
      const r = await useOptimizationStore.getState().revert(item)
      if (r.success) reverted++
    }
    toast.success('Perfil revertido', `${reverted} otimizações restauradas ao padrão.`)
  }

  const handleSelect = (id: OptimizationProfile) => {
    setActiveProfile(activeProfile === id ? null : id)
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-xl font-bold tracking-tight md:text-2xl">Perfis de otimização</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cada perfil ativa um conjunto de otimizações pensado para o seu tipo de uso. Selecione um perfil para filtrar
          as otimizações recomendadas.
        </p>
      </div>

      {/* Seletor de placa de vídeo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MonitorPlay className="h-5 w-5 text-primary" />
            Qual é a sua placa de vídeo?
          </CardTitle>
          <CardDescription>
            Escolha a marca para usar as otimizações corretas de GPU neste perfil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GpuSelector />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {profiles.map((profile) => {
          const items = optimizations.filter((o) => o.profiles.includes(profile.id) && isVendorCompatible(o))
          const applied = items.filter((o) => appliedIds.has(o.id)).length
          const pending = items.length - applied
          const active = activeProfile === profile.id

          return (
            <Card
              key={profile.id}
              className={cn(
                'relative overflow-hidden transition-all duration-300',
                active ? 'border-primary/50 shadow-glow' : 'card-hover'
              )}
            >
              <div className={cn('pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent', profile.accent)} aria-hidden="true" />
              <CardContent className="relative p-6">
                <div className="flex items-start justify-between">
                  <span className={cn('flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10', profile.color)}>
                    {profileIcons[profile.id]}
                  </span>
                  {active && <Badge variant="primary" dot>Ativo</Badge>}
                </div>

                <h2 className="mt-4 text-lg font-semibold text-card-foreground">{profile.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{profile.description}</p>

                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="tabular-nums">{applied}/{items.length}</span> otimizações aplicadas
                </div>

                <div className="mt-4 space-y-2">
                  <Button
                    fullWidth
                    variant={active ? 'secondary' : 'primary'}
                    onClick={() => handleSelect(profile.id)}
                    leftIcon={active ? <Check className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  >
                    {active ? 'Perfil selecionado' : 'Selecionar perfil'}
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isApplying || pending === 0}
                      loading={isApplying && applyingId === profile.id}
                      onClick={() => applyAllForProfile(profile.id)}
                      leftIcon={<Zap className="h-3.5 w-3.5" />}
                    >
                      Aplicar tudo
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isApplying || applied === 0}
                      onClick={() => revertAllForProfile(profile.id)}
                      leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
                    >
                      Reverter
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Lista de otimizações do perfil */}
      {activeProfile && (
        <Card className="animate-fade-in">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-card-foreground">
                  Otimizações do perfil {profiles.find((p) => p.id === activeProfile)?.name}
                </h2>
                <p className="text-xs text-muted-foreground">Lista das otimizações recomendadas para este perfil</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setPage('optimize')} rightIcon={<ArrowRight className="h-4 w-4" />}>
                Ver todas
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {optimizations
                .filter((o) => o.profiles.includes(activeProfile) && isVendorCompatible(o))
                .map((item) => {
                  const applied = appliedIds.has(item.id)
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        'flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors',
                        applied ? 'border-success/30 bg-success/5' : 'border-border/60 bg-background/30'
                      )}
                    >
                      <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', applied ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground')}>
                        {applied ? <Check className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-card-foreground">{item.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                      </div>
                      <Badge variant={applied ? 'success' : 'outline'} dot>
                        {applied ? 'Aplicada' : 'Pendente'}
                      </Badge>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {!isElectron && (
        <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-xs text-primary">
          <strong>Modo demonstração:</strong> você está visualizando em navegador. As otimizações simulam execução. No
          aplicativo Windows, os comandos reais são executados.
        </div>
      )}
    </div>
  )
}