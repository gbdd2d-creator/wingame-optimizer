import * as React from 'react'
import {
  ShieldCheck,
  ShieldAlert,
  Database,
  HardDrive,
  Monitor,
  Wifi,
  Cpu,
  RefreshCw,
  Download,
  Trash2,
  ExternalLink,
  Clock,
  FileDown,
  RotateCcw,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { useToolsStore, useOptimizationStore } from '@/store'
import { bridge } from '@/lib/bridge'
import { formatDate } from '@/lib/utils'
import { useRestoreStore } from '@/store'
import type { RestorePoint, DriverInfo } from '@/types'

const driverIcons: Record<string, React.ReactNode> = {
  vga: <Monitor className="h-4 w-4" />,
  sound: <Cpu className="h-4 w-4" />,
  net: <Wifi className="h-4 w-4" />,
}

const driverLabels: Record<string, string> = {
  vga: 'Placa de vídeo',
  sound: 'Áudio',
  net: 'Rede',
}

export function ToolsPage() {
  const { restorePoints, setRestorePoints, loadingRestore, setLoadingRestore } = useRestoreStore()
  const { drivers, setDrivers, loadingDrivers, setLoadingDrivers, lastDriverCheck, setLastDriverCheck } = useToolsStore()
  const { results } = useOptimizationStore()
  const toast = useToast()

  const [createName, setCreateName] = React.useState('')
  const [createOpen, setCreateOpen] = React.useState(false)
  const [restoreTarget, setRestoreTarget] = React.useState<RestorePoint | null>(null)
  const [restoreOpen, setRestoreOpen] = React.useState(false)
  const [loadingCreate, setLoadingCreate] = React.useState(false)
  const [loadingRestoreRun, setLoadingRestoreRun] = React.useState(false)

  const appliedCount = Object.values(results).filter((r) => r.success).length

  const loadRestorePoints = React.useCallback(async () => {
    setLoadingRestore(true)
    const res = await bridge.restore.list()
    if (res.success) {
      setRestorePoints(res.points)
    }
    setLoadingRestore(false)
  }, [setRestorePoints, setLoadingRestore])

  React.useEffect(() => {
    loadRestorePoints()
  }, [loadRestorePoints])

  const loadDrivers = React.useCallback(async () => {
    setLoadingDrivers(true)
    const res = await bridge.drivers.list()
    if (res.success) {
      setDrivers(res.drivers)
      setLastDriverCheck(new Date().toISOString())
    } else {
      toast.error('Erro ao verificar drivers', res.error ?? 'Não foi possível listar os drivers.')
    }
    setLoadingDrivers(false)
  }, [setDrivers, setLoadingDrivers, setLastDriverCheck, toast])

  const handleCreate = async () => {
    if (!createName.trim()) return
    setLoadingCreate(true)
    const res = await bridge.restore.create(createName)
    setLoadingCreate(false)
    setCreateOpen(false)
    if (res.success) {
      toast.success('Ponto de restauração criado', 'Seu sistema agora possui um ponto de segurança.')
      setCreateName('')
      loadRestorePoints()
    } else {
      toast.error('Falha ao criar ponto', res.error ?? 'Tente novamente.')
    }
  }

  const handleRestore = async () => {
    if (!restoreTarget) return
    setLoadingRestoreRun(true)
    const res = await bridge.restore.restore(restoreTarget.sequenceNumber)
    setLoadingRestoreRun(false)
    setRestoreOpen(false)
    if (res.success) {
      toast.warning(
        'Restauração iniciada',
        'O computador será reiniciado para concluir a restauração. Salve seu trabalho.'
      )
    } else {
      toast.error('Falha na restauração', res.error ?? 'Tente novamente.')
    }
  }

  const openDriver = async (driver: DriverInfo) => {
    if (driver.downloadUrl) {
      await bridge.openExternal(driver.downloadUrl)
    } else {
      toast.info('Sem página de download', 'Use o site do fabricante para buscar o driver.')
    }
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-xl font-bold tracking-tight md:text-2xl">Ferramentas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ponto de restauração e gerenciamento de drivers para manter seu sistema seguro e atualizado.
        </p>
      </div>

      {/* Banner de segurança */}
      <div className="flex items-start gap-3 rounded-xl border border-success/30 bg-success/10 p-4">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" />
        <div className="text-xs text-success">
          <p className="font-semibold">Dica de segurança</p>
          <p className="mt-1">
            Você já aplicou {appliedCount} otimizações. Crie um ponto de restauração agora para poder voltar ao estado
            atual em caso de problemas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pontos de restauração */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Pontos de restauração
              </CardTitle>
              <CardDescription>Backups do sistema para reverter mudanças</CardDescription>
            </div>
            <Button size="sm" leftIcon={<FileDown className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
              Criar ponto
            </Button>
          </CardHeader>
          <CardContent>
            {loadingRestore ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-20 animate-pulse rounded-xl bg-muted/40" />
                ))}
              </div>
            ) : restorePoints.length === 0 ? (
              <div className="py-10 text-center">
                <ShieldAlert className="mx-auto h-12 w-12 text-muted-foreground/40" />
                <p className="mt-3 font-semibold text-card-foreground">Nenhum ponto encontrado</p>
                <p className="text-sm text-muted-foreground">Crie um ponto de restauração para começar.</p>
              </div>
            ) : (
              <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
                {restorePoints.map((point) => (
                  <div key={point.id} className="flex items-start gap-3 rounded-xl border border-border/50 bg-background/30 p-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Database className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-card-foreground">{point.name}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" /> {formatDate(point.createdAt)} • Sequência {point.sequenceNumber}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setRestoreTarget(point)
                        setRestoreOpen(true)
                      }}
                      leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
                    >
                      Restaurar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Drivers */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-success" />
                Drivers do sistema
              </CardTitle>
              <CardDescription>Versões instaladas e link para atualização oficial</CardDescription>
            </div>
            <Button size="sm" variant="secondary" onClick={loadDrivers} loading={loadingDrivers} leftIcon={<RefreshCw className="h-4 w-4" />}>
              Verificar
            </Button>
          </CardHeader>
          <CardContent>
            {lastDriverCheck && (
              <p className="mb-3 text-[11px] text-muted-foreground">
                Última verificação: {formatDate(lastDriverCheck)}
              </p>
            )}
            {loadingDrivers ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-20 animate-pulse rounded-xl bg-muted/40" />
                ))}
              </div>
            ) : drivers.length === 0 ? (
              <div className="py-10 text-center">
                <HardDrive className="mx-auto h-12 w-12 text-muted-foreground/40" />
                <p className="mt-3 font-semibold text-card-foreground">Drivers não verificados</p>
                <p className="text-sm text-muted-foreground">Clique em "Verificar" para listar seus drivers.</p>
              </div>
            ) : (
              <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
                {drivers.map((driver) => (
                  <div key={driver.id} className="flex items-start gap-3 rounded-xl border border-border/50 bg-background/30 p-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
                      {driverIcons[driver.kind] ?? <HardDrive className="h-5 w-5" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-card-foreground">{driver.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {driverLabels[driver.kind] ?? 'Dispositivo'} • v{driver.version} • {driver.date}
                      </p>
                      <Badge variant="outline" className="mt-1.5">{driver.provider}</Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDriver(driver)}
                      leftIcon={<ExternalLink className="h-3.5 w-3.5" />}
                      title="Abrir página oficial do driver"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Nota sobre drivers */}
      <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/10 p-4 text-xs text-primary">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">Sobre atualização de drivers</p>
          <p className="mt-1">
            Mantenha os drivers da GPU sempre atualizados pelo site oficial do fabricante (NVIDIA, AMD ou Intel). Drivers
            atualizados corrigem bugs, aumentam FPS e melhoram a estabilidade dos jogos.
          </p>
        </div>
      </div>

      {/* Modal criar ponto */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Criar ponto de restauração"
        description="Crie um backup do estado atual do sistema antes de fazer mudanças."
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} loading={loadingCreate} disabled={!createName.trim()}>
              <Database className="h-4 w-4" /> Criar
            </Button>
          </>
        }
      >
        <label className="mb-1.5 block text-sm font-medium text-card-foreground" htmlFor="rp-name">
          Nome do ponto
        </label>
        <input
          id="rp-name"
          className="input-field"
          placeholder="Ex: Antes das otimizações"
          value={createName}
          onChange={(e) => setCreateName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          autoFocus
        />
        <p className="mt-2 text-xs text-muted-foreground">
          A criação pode levar alguns minutos. O ponto será listado aqui e nas opções de restauração do Windows.
        </p>
      </Modal>

      {/* Modal restaurar */}
      <Modal
        open={restoreOpen}
        onClose={() => setRestoreOpen(false)}
        title="Restaurar sistema"
        description={`Restaurar o sistema para "${restoreTarget?.name}"?`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setRestoreOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleRestore} loading={loadingRestoreRun}>
              <RotateCcw className="h-4 w-4" /> Restaurar e reiniciar
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <div className="text-xs text-warning">
            <p className="font-semibold">Aviso importante</p>
            <p className="mt-1">
              A restauração do sistema reiniciará o computador automaticamente. Salve todo o trabalho antes de
              continuar. Programas instalados após o ponto de restauração podem ser removidos.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  )
}