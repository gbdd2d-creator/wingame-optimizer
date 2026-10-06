import * as React from 'react'
import {
  Eraser,
  FolderOpen,
  Database,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  HardDrive,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { useSystemStore } from '@/store'
import { bridge } from '@/lib/bridge'
import { formatBytes } from '@/lib/utils'

interface CleanupResult {
  analyzedBytes: number | null
  freedBytes: number | null
  lastRun: string | null
}

export function CleanupPage() {
  const toast = useToast()
  const { isAdmin } = useSystemStore()
  const [analyzing, setAnalyzing] = React.useState(false)
  const [cleaning, setCleaning] = React.useState(false)
  const [result, setResult] = React.useState<CleanupResult>({
    analyzedBytes: null,
    freedBytes: null,
    lastRun: null,
  })

  const handleAnalyze = async () => {
    setAnalyzing(true)
    const res = await bridge.cleanup.analyze()
    setAnalyzing(false)
    if (res.success) {
      setResult((r) => ({ ...r, analyzedBytes: res.bytes }))
    } else {
      toast.error('Falha ao analisar', res.error ?? 'Não foi possível analisar os arquivos temporários.')
    }
  }

  const handleClean = async () => {
    setCleaning(true)
    const res = await bridge.cleanup.run()
    setCleaning(false)
    if (res.success) {
      setResult((r) => ({
        analyzedBytes: null,
        freedBytes: res.bytes,
        lastRun: new Date().toISOString(),
      }))
      toast.success('Limpeza concluída', `Espaço liberado: ${formatBytes(res.bytes)}`)
    } else {
      toast.error('Falha na limpeza', res.error ?? 'Alguns arquivos podem estar em uso e não foram removidos.')
    }
  }

  const totalBytes = result.freedBytes ?? result.analyzedBytes ?? null

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-xl font-bold tracking-tight md:text-2xl">Limpeza do sistema</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Libere espaço em disco removendo arquivos temporários do Windows de forma rápida e segura.
        </p>
      </div>

      {/* Card principal */}
      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" aria-hidden="true" />
        <CardContent className="relative p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex shrink-0 items-center justify-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/25 to-transparent">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/50 bg-card text-primary shadow-elevation-2">
                  <Eraser className="h-7 w-7" />
                </span>
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-card-foreground">Limpar arquivos temporários</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Remove arquivos temporários do usuário, arquivos temporários do sistema e o cache de atualizações do
                Windows. É seguro — não apaga seus documentos, fotos ou arquivos pessoais. Alguns arquivos em uso podem
                ser mantidos pelo próprio Windows.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="success" dot>Seguro</Badge>
                <Badge variant="outline">Sem reinício necessário</Badge>
                {!isAdmin && <Badge variant="warning" dot>Recomendado como administrador</Badge>}
              </div>
            </div>
          </div>

          {/* Resultado */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border/50 bg-background/40 p-4 text-center">
              <p className="text-xs text-muted-foreground">Espaço identificado</p>
              <p className="mt-1 text-xl font-bold tabular-nums text-card-foreground">
                {result.analyzedBytes !== null ? formatBytes(result.analyzedBytes) : '—'}
              </p>
            </div>
            <div className="rounded-xl border border-border/50 bg-background/40 p-4 text-center">
              <p className="text-xs text-muted-foreground">Espaço liberado</p>
              <p className="mt-1 text-xl font-bold tabular-nums text-success">
                {result.freedBytes !== null ? formatBytes(result.freedBytes) : '—'}
              </p>
            </div>
            <div className="rounded-xl border border-border/50 bg-background/40 p-4 text-center">
              <p className="text-xs text-muted-foreground">Última limpeza</p>
              <p className="mt-1 text-sm font-semibold text-card-foreground">
                {result.lastRun ? new Date(result.lastRun).toLocaleString('pt-BR') : '—'}
              </p>
            </div>
          </div>

          {/* Ações */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={handleAnalyze} loading={analyzing} leftIcon={<RefreshCw className="h-4 w-4" />}>
              Analisar espaço
            </Button>
            <Button
              onClick={handleClean}
              loading={cleaning}
              disabled={cleaning}
              leftIcon={<Trash2 className="h-4 w-4" />}
            >
              Limpar agora
            </Button>
            {totalBytes !== null && (
              <Badge variant="info" className="ml-1">
                <Sparkles className="h-3.5 w-3.5" /> Até {formatBytes(totalBytes)} serão liberados
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* O que é limpo */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <FolderOpen className="h-4 w-4 text-primary" />
              Temporários do usuário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Arquivos temporários criados por programas e pelo Windows na pasta Temp do seu usuário. Crescem com o uso
              diário e podem acumular vários GB.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <HardDrive className="h-4 w-4 text-success" />
              Temporários do sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Arquivos temporários do sistema operacional (C:\Windows\Temp). Exigem permissão de administrador para
              serem removidos.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Database className="h-4 w-4 text-warning" />
              Cache de atualizações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Instaladores baixados pelo Windows Update já aplicados no sistema. Podem ocupar bastante espaço e são
              desnecessários após a instalação.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Avisos */}
      <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4 text-xs text-warning">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">Observação</p>
          <p className="mt-1">
            Se algum programa estiver aberto, seus arquivos temporários podem estar em uso e não serão removidos —
            feche jogos e aplicativos para liberar o máximo de espaço. Para limpeza mais profunda (incluindo a Lixeira),
            use a ferramenta "Limpeza de disco" do Windows.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-success/30 bg-success/10 p-4 text-xs text-success">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">Seguro por design</p>
          <p className="mt-1">
            Esta limpeza nunca toca em arquivos pessoais, programas instalados ou configurações do sistema. Você pode
            usá-la quantas vezes quiser — é totalmente reversível no sentido de que o Windows recria os arquivos
            temporários conforme necessário.
          </p>
        </div>
      </div>
    </div>
  )
}