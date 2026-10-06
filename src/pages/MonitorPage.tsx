import * as React from 'react'
import { Cpu, MemoryStick, Monitor, HardDrive, Wifi, Play, Pause, Activity } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useMetricsStore } from '@/store'
import { bridge } from '@/lib/bridge'
import { formatBytes } from '@/lib/utils'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { SystemMetrics } from '@/types'

const COLORS = {
  cpu: '#a78bfa',
  memory: '#60a5fa',
  gpu: '#34d399',
  disk: '#fbbf24',
  network: '#f472b6',
  temp: '#f87171',
}

function MetricTile({
  label,
  value,
  suffix,
  sub,
  icon,
  color,
}: {
  label: string
  value: string
  suffix?: string
  sub: string
  icon: React.ReactNode
  color: string
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-background/30 p-4">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span style={{ color }}>{icon}</span>
          {label}
        </span>
        <Badge variant="outline" className="text-[10px]">{sub}</Badge>
      </div>
      <p className="mt-2 text-xl font-bold tabular-nums" style={{ color }}>
        {value}
        {suffix && <span className="ml-1 text-sm font-medium text-muted-foreground">{suffix}</span>}
      </p>
    </div>
  )
}

export function MonitorPage() {
  const { metrics, history, isMonitoring, interval, setMetrics, addHistory, setMonitoring, setInterval, clearHistory } = useMetricsStore()
  const [selectedSeries, setSelectedSeries] = React.useState<'cpu' | 'memory' | 'gpu'>('cpu')
  const timerRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    const tick = async () => {
      const m = await bridge.monitor.getMetrics()
      setMetrics(m)
      addHistory(m)
    }

    if (isMonitoring) {
      tick()
      timerRef.current = window.setInterval(tick, interval)
    }

    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isMonitoring, interval, setMetrics, addHistory])

  const chartData = React.useMemo(() => {
    return history.map((h: SystemMetrics, i: number) => ({
      time: `${(i * interval) / 1000}s`,
      cpu: Math.round(h.cpu.usage),
      memory: Math.round(h.memory.percentage),
      gpu: Math.round(h.gpu.usage),
    }))
  }, [history, interval])

  const seriesConfig = {
    cpu: { key: 'cpu' as const, label: 'CPU', color: COLORS.cpu },
    memory: { key: 'memory' as const, label: 'RAM', color: COLORS.memory },
    gpu: { key: 'gpu' as const, label: 'GPU', color: COLORS.gpu },
  }

  const current = metrics

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">Monitor de performance</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acompanhe em tempo real o uso de CPU, memória, GPU, rede e disco.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={interval}
            onChange={(e) => setInterval(Number(e.target.value))}
            className="input-field w-auto py-2 text-xs"
            aria-label="Intervalo de atualização"
          >
            <option value={1000}>1s</option>
            <option value={2000}>2s</option>
            <option value={5000}>5s</option>
            <option value={10000}>10s</option>
          </select>
          <Button
            variant={isMonitoring ? 'secondary' : 'primary'}
            leftIcon={isMonitoring ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            onClick={() => setMonitoring(!isMonitoring)}
          >
            {isMonitoring ? 'Pausar' : 'Iniciar'}
          </Button>
          <Button variant="ghost" size="icon" onClick={clearHistory} aria-label="Limpar histórico">
            <Activity className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMonitoring && history.length === 0 && (
        <Card className="border-dashed p-10 text-center">
          <Activity className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 font-semibold text-card-foreground">Monitor parado</p>
          <p className="text-sm text-muted-foreground">Clique em "Iniciar" para começar a coletar métricas em tempo real.</p>
        </Card>
      )}

      {(isMonitoring || history.length > 0) && current && (
        <>
          {/* Métricas atuais */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
            <MetricTile
              label="CPU"
              value={`${Math.round(current.cpu.usage)}`}
              suffix="%"
              sub={current.cpu.temperature ? `${current.cpu.temperature}°C` : `${current.cpu.cores} núcleos`}
              icon={<Cpu className="h-4 w-4" />}
              color={COLORS.cpu}
            />
            <MetricTile
              label="Memória"
              value={`${Math.round(current.memory.percentage)}`}
              suffix="%"
              sub={formatBytes(current.memory.used)}
              icon={<MemoryStick className="h-4 w-4" />}
              color={COLORS.memory}
            />
            <MetricTile
              label="GPU"
              value={`${Math.round(current.gpu.usage)}`}
              suffix="%"
              sub={current.gpu.temperature ? `${current.gpu.temperature}°C` : current.gpu.name.split(' ').slice(0, 2).join(' ')}
              icon={<Monitor className="h-4 w-4" />}
              color={COLORS.gpu}
            />
            <MetricTile
              label="Disco (C:)"
              value={`${Math.round(current.disk.c.percentage)}`}
              suffix="%"
              sub={formatBytes(current.disk.c.used)}
              icon={<HardDrive className="h-4 w-4" />}
              color={COLORS.disk}
            />
            <MetricTile
              label="Rede"
              value={`${Math.round((current.network.download + current.network.upload) / 1024 / 1024)}`}
              suffix="MB/s"
              sub={`${current.network.latency || '—'} ms`}
              icon={<Wifi className="h-4 w-4" />}
              color={COLORS.network}
            />
          </div>

          {/* Detalhes */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardContent className="p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-semibold text-card-foreground">Uso ao longo do tempo</h2>
                  <div className="flex gap-1">
                    {(Object.keys(seriesConfig) as Array<keyof typeof seriesConfig>).map((key) => (
                      <button
                        key={key}
                        onClick={() => setSelectedSeries(key)}
                        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                          selectedSeries === key ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {seriesConfig[key].label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                      <defs>
                        <linearGradient id="seriesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={seriesConfig[selectedSeries].color} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={seriesConfig[selectedSeries].color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.4)" vertical={false} />
                      <XAxis dataKey="time" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} tickLine={false} axisLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} tickLine={false} axisLine={false} unit="%" />
                      <Tooltip
                        contentStyle={{
                          background: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                        labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                      />
                      <Area
                        type="monotone"
                        dataKey={seriesConfig[selectedSeries].key}
                        stroke={seriesConfig[selectedSeries].color}
                        strokeWidth={2}
                        fill="url(#seriesGradient)"
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <h2 className="mb-4 font-semibold text-card-foreground">Utilização atual</h2>
                <div className="space-y-5">
                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">CPU</span>
                      <span className="font-medium tabular-nums" style={{ color: COLORS.cpu }}>{Math.round(current.cpu.usage)}%</span>
                    </div>
                    <Progress value={current.cpu.usage} max={100} variant={current.cpu.usage > 85 ? 'destructive' : 'default'} size="sm" />
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Memória</span>
                      <span className="font-medium tabular-nums" style={{ color: COLORS.memory }}>{Math.round(current.memory.percentage)}%</span>
                    </div>
                    <Progress value={current.memory.percentage} max={100} variant={current.memory.percentage > 85 ? 'destructive' : 'default'} size="sm" />
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">GPU</span>
                      <span className="font-medium tabular-nums" style={{ color: COLORS.gpu }}>{Math.round(current.gpu.usage)}%</span>
                    </div>
                    <Progress value={current.gpu.usage} max={100} variant={current.gpu.usage > 85 ? 'destructive' : 'default'} size="sm" />
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Disco (C:)</span>
                      <span className="font-medium tabular-nums" style={{ color: COLORS.disk }}>{Math.round(current.disk.c.percentage)}%</span>
                    </div>
                    <Progress value={current.disk.c.percentage} max={100} variant="warning" size="sm" />
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Download</span>
                      <span className="font-medium tabular-nums" style={{ color: COLORS.network }}>
                        {(current.network.download / 1024 / 1024).toFixed(1)} MB/s
                      </span>
                    </div>
                    <Progress value={Math.min((current.network.download / 1024 / 1024) * 10, 100)} max={100} variant="default" size="sm" />
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Upload</span>
                      <span className="font-medium tabular-nums" style={{ color: COLORS.network }}>
                        {(current.network.upload / 1024 / 1024).toFixed(1)} MB/s
                      </span>
                    </div>
                    <Progress value={Math.min((current.network.upload / 1024 / 1024) * 10, 100)} max={100} variant="default" size="sm" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detalhes GPU */}
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-3 font-semibold text-card-foreground">Detalhes da GPU</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">Modelo</p>
                  <p className="mt-1 truncate text-sm font-medium text-card-foreground" title={current.gpu.name}>{current.gpu.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Memória de vídeo</p>
                  <p className="mt-1 text-sm font-medium tabular-nums text-card-foreground">
                    {formatBytes(current.gpu.memoryUsed)} / {formatBytes(current.gpu.memoryTotal)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Temperatura</p>
                  <p className="mt-1 text-sm font-medium tabular-nums text-card-foreground">
                    {current.gpu.temperature ? `${current.gpu.temperature}°C` : 'Não disponível'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Utilização</p>
                  <p className="mt-1 text-sm font-medium tabular-nums text-card-foreground">{Math.round(current.gpu.usage)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}