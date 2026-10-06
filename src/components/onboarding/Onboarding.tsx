import * as React from 'react'
import {
  Zap,
  Layers,
  Users,
  Activity,
  Wrench,
  ChevronRight,
  ChevronLeft,
  X,
  Rocket,
  Play,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useSettingsStore } from '@/store'

interface OnboardingStep {
  id: string
  icon: React.ReactNode
  accent: string
  title: string
  description: string
  bullets: { label: string; desc: string }[]
}

const steps: OnboardingStep[] = [
  {
    id: 'welcome',
    icon: <Zap className="h-8 w-8" />,
    accent: 'from-primary/25 to-transparent',
    title: 'Bem-vindo ao WinGame Optimizer',
    description:
      'Otimizador completo do Windows feito para gamers. Aplique ajustes seguros para ganhar mais FPS, reduzir latência, liberar memória e deixar seu PC em sua melhor forma para jogar.',
    bullets: [
      { label: 'FPS maior', desc: 'Ajustes de CPU, GPU e sistema que reduzem engasgos' },
      { label: 'Latência menor', desc: 'Otimizações de rede para reduzir o ping' },
      { label: 'Recursos liberados', desc: 'Menos apps e serviços rodando em segundo plano' },
    ],
  },
  {
    id: 'optimize',
    icon: <Layers className="h-8 w-8" />,
    accent: 'from-blue-500/25 to-transparent',
    title: 'Otimizações organizadas e explicadas',
    description:
      'São 42 otimizações divididas em 8 categorias. Cada uma explica em português o que faz no seu computador, mostra o nível de risco e o impacto, e pode ser revertida a qualquer momento.',
    bullets: [
      { label: '8 categorias', desc: 'Sistema, Rede, GPU, Energia, Debloat, Serviços, Armazenamento e Privacidade' },
      { label: 'Risco e impacto', desc: 'Saiba exatamente o que vai mudar antes de aplicar' },
      { label: 'Tudo reversível', desc: 'Botão "Reverter" restaura o padrão do Windows' },
    ],
  },
  {
    id: 'profiles',
    icon: <Users className="h-8 w-8" />,
    accent: 'from-emerald-500/25 to-transparent',
    title: 'Perfis prontos com 1 clique',
    description:
      'Não quer escolher item por item? Escolha um perfil e aplique um conjunto de otimizações pensado para o seu estilo de jogo.',
    bullets: [
      { label: 'Competitivo', desc: 'Máximo FPS e menor latência para jogos online' },
      { label: 'Casual', desc: 'Equilíbrio entre performance e estabilidade' },
      { label: 'Streaming', desc: 'Otimizado para jogar e transmitir ao mesmo tempo' },
    ],
  },
  {
    id: 'monitor',
    icon: <Activity className="h-8 w-8" />,
    accent: 'from-fuchsia-500/25 to-transparent',
    title: 'Monitor de performance em tempo real',
    description:
      'Acompanhe o uso de CPU, memória, GPU, disco e rede ao vivo, com gráfico histórico. Descubra se seu PC está com gargalo e confirme os ganhos das otimizações.',
    bullets: [
      { label: 'Métricas ao vivo', desc: 'CPU, RAM, GPU, disco, download e upload' },
      { label: 'Gráfico histórico', desc: 'Visualize o uso ao longo do tempo' },
      { label: 'Intervalo ajustável', desc: 'De 1 segundo até 10 segundos' },
    ],
  },
  {
    id: 'tools',
    icon: <Wrench className="h-8 w-8" />,
    accent: 'from-amber-500/25 to-transparent',
    title: 'Ferramentas de segurança e drivers',
    description:
      'Antes de otimizar, crie um ponto de restauração do sistema — assim você pode voltar ao estado anterior se algo der errado. Confira também os drivers instalados com acesso à página oficial de atualização.',
    bullets: [
      { label: 'Pontos de restauração', desc: 'Backup do sistema antes de qualquer mudança' },
      { label: 'Verificação de drivers', desc: 'Veja versões de GPU, áudio e rede instaladas' },
      { label: 'Links oficiais', desc: 'Acesso direto ao site do fabricante para atualizar' },
    ],
  },
  {
    id: 'start',
    icon: <Rocket className="h-8 w-8" />,
    accent: 'from-primary/25 to-transparent',
    title: 'Pronto para começar!',
    description:
      'Siga estas recomendações para obter o melhor resultado com segurança:',
    bullets: [
      { label: '1. Execute como administrador', desc: 'Otimizações de sistema exigem privilégios de admin' },
      { label: '2. Crie um ponto de restauração', desc: 'Na aba Ferramentas, antes de aplicar mudanças' },
      { label: '3. Reinicie ao final', desc: 'Algumas otimizações só se aplicam totalmente após reiniciar' },
    ],
  },
]

export function Onboarding() {
  const { settings, setSettings } = useSettingsStore()
  const [current, setCurrent] = React.useState(0)
  const [visible, setVisible] = React.useState(false)
  const [closing, setClosing] = React.useState(false)

  const show = !settings.onboardingSeen
  const step = steps[current]
  const isLast = current === steps.length - 1

  React.useEffect(() => {
    if (show) {
      setVisible(true)
    }
  }, [show])

  React.useEffect(() => {
    const open = () => {
      setCurrent(0)
      setClosing(false)
      setVisible(true)
    }
    window.addEventListener('wgo:open-onboarding', open)
    return () => window.removeEventListener('wgo:open-onboarding', open)
  }, [])

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!visible || closing) return
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, closing, current])

  const close = () => {
    setClosing(true)
    setTimeout(() => {
      setVisible(false)
      setClosing(false)
      setSettings({ onboardingSeen: true })
    }, 200)
  }

  const finish = () => {
    setClosing(true)
    setTimeout(() => {
      setVisible(false)
      setClosing(false)
      setSettings({ onboardingSeen: true })
    }, 200)
  }

  const next = () => {
    if (isLast) return finish()
    setCurrent((c) => Math.min(c + 1, steps.length - 1))
  }

  const prev = () => setCurrent((c) => Math.max(c - 1, 0))

  if (!visible) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-[90] flex items-center justify-center p-4 transition-opacity duration-200',
        closing ? 'opacity-0' : 'opacity-100'
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Tutorial de boas-vindas"
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={close} aria-hidden="true" />

      <div
        className={cn(
          'relative z-10 w-full max-w-3xl overflow-hidden rounded-2xl border border-border/60 bg-card shadow-elevation-4 transition-transform duration-200',
          closing ? 'scale-95' : 'scale-100'
        )}
      >
        {/* Barra de progresso */}
        <div className="absolute inset-x-0 top-0 z-10 h-1 bg-muted">
          <div
            className="h-full bg-gradient-to-r from-primary to-fuchsia-400 transition-all duration-500"
            style={{ width: `${((current + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-0">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold">WinGame Optimizer</span>
            <Badge variant="outline" className="ml-1 text-[10px]">Tutorial</Badge>
          </div>
          <button
            onClick={close}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Fechar tutorial"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Conteúdo do passo */}
        <div className="p-5 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            {/* Visual */}
            <div className="flex shrink-0 justify-center">
              <div
                className={cn(
                  'relative flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br to-transparent md:h-36 md:w-36',
                  step.accent
                )}
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-border/50 bg-card text-primary shadow-elevation-2 md:h-24 md:w-24">
                  {step.icon}
                </div>
              </div>
            </div>

            {/* Texto */}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Passo {current + 1} de {steps.length}
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-card-foreground md:text-2xl">
                {step.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          </div>

          {/* Bullets */}
          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
            {step.bullets.map((b) => (
              <div
                key={b.label}
                className="rounded-xl border border-border/50 bg-background/40 p-4"
              >
                <p className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {b.label}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer / navegação */}
        <div className="flex items-center justify-between border-t border-border/50 bg-background/30 p-5">
          {/* Dots */}
          <div className="flex items-center gap-1.5" aria-label="Progresso do tutorial">
            {steps.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setCurrent(i)}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  i === current ? 'w-6 bg-primary' : 'w-2 bg-muted hover:bg-muted-foreground/50'
                )}
                aria-label={`Ir para passo ${i + 1}`}
                aria-current={i === current}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {current > 0 && (
              <Button variant="ghost" size="sm" onClick={prev} leftIcon={<ChevronLeft className="h-4 w-4" />}>
                Anterior
              </Button>
            )}
            {isLast ? (
              <Button onClick={finish} leftIcon={<Play className="h-4 w-4" />}>
                Começar a otimizar
              </Button>
            ) : (
              <Button onClick={next} rightIcon={<ChevronRight className="h-4 w-4" />}>
                Próximo
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}