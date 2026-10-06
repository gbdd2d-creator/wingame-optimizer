import * as React from 'react'
import { Monitor, Cpu, Check, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSettingsStore, useSystemStore } from '@/store'
import type { GpuVendorPref } from '@/types'

const options: { id: GpuVendorPref; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: 'auto', label: 'Automático', desc: 'Detecta sozinho', icon: <Sparkles className="h-4 w-4" /> },
  { id: 'nvidia', label: 'NVIDIA', desc: 'GeForce', icon: <Monitor className="h-4 w-4" /> },
  { id: 'amd', label: 'AMD', desc: 'Radeon', icon: <Cpu className="h-4 w-4" /> },
  { id: 'intel', label: 'Intel', desc: 'Arc / Iris', icon: <Cpu className="h-4 w-4" /> },
]

const vendorLabel: Record<string, string> = {
  nvidia: 'NVIDIA',
  amd: 'AMD',
  intel: 'Intel',
}

export function GpuSelector() {
  const { settings, setSettings } = useSettingsStore()
  const { info } = useSystemStore()
  const detected = info?.gpuVendor
  const active = settings.gpuVendorPref

  const hint =
    active === 'auto'
      ? detected && detected !== 'other'
        ? `GPU detectada: ${info?.gpuName}`
        : 'Não foi possível detectar a placa — escolha a marca manualmente.'
      : `Usando otimizações específicas para ${vendorLabel[active]}.`

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {options.map((o) => {
          const isActive = active === o.id
          return (
            <button
              key={o.id}
              onClick={() => setSettings({ gpuVendorPref: o.id })}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border p-4 transition-all',
                isActive
                  ? 'border-primary/50 bg-primary/10 text-primary'
                  : 'border-border/60 text-muted-foreground hover:border-primary/25 hover:text-foreground'
              )}
            >
              <span className="relative">
                {o.icon}
                {isActive && (
                  <span className="absolute -right-2.5 -top-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </span>
              <span className="text-xs font-semibold">{o.label}</span>
              <span className="text-[10px] text-muted-foreground">{o.desc}</span>
            </button>
          )
        })}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{hint}</p>
    </div>
  )
}