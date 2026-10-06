import { isElectron } from './utils'
import type { SystemInfo, SystemMetrics, DriverInfo, RestorePoint } from '@/types'

// Bridge para o backend Electron com fallback de navegador (para desenvolvimento/preview)

export const bridge = {
  get isElectron() {
    return isElectron
  },

  window: {
    minimize: () => window.electronAPI?.window.minimize(),
    maximize: () => window.electronAPI?.window.maximize(),
    close: () => window.electronAPI?.window.close(),
    isMaximized: async () => window.electronAPI?.window.isMaximized() ?? false,
    onMaximized: (cb: (max: boolean) => void) => window.electronAPI?.window.onMaximized(cb) ?? (() => {}),
  },

  app: {
    onBeforeClose: (cb: () => void) => window.electronAPI?.app.onBeforeClose(cb) ?? (() => {}),
  },

  optimize: {
    async run(command: string): Promise<{ success: boolean; stdout: string; stderr: string; error: string | null }> {
      if (isElectron) {
        return window.electronAPI!.optimize.run(command)
      }
      await new Promise((r) => setTimeout(r, 800))
      return { success: true, stdout: 'Simulação (modo navegador)', stderr: '', error: null }
    },
  },

  system: {
    async info(): Promise<SystemInfo> {
      if (isElectron) {
        return window.electronAPI!.system.info()
      }
      return {
        osName: 'Simulação',
        osVersion: '10.0',
        osBuild: '00000',
        cpuName: 'CPU Desconhecida',
        cpuCores: navigator.hardwareConcurrency || 4,
        cpuThreads: navigator.hardwareConcurrency || 4,
        gpuName: 'GPU Desconhecida',
        gpuVendor: 'other',
        ramTotal: 16 * 1024 * 1024 * 1024,
        ramUsage: 40,
        diskTotal: 512 * 1024 * 1024 * 1024,
        diskUsage: 55,
        disks: [
          { device: 'C', label: '', size: 512 * 1024 * 1024 * 1024, free: 230 * 1024 * 1024 * 1024, usage: 55 },
          { device: 'D', label: 'Jogos', size: 1024 * 1024 * 1024 * 1024, free: 820 * 1024 * 1024 * 1024, usage: 20 },
        ],
        architecture: 'x64',
        hostname: 'localhost',
        bootTime: '',
      }
    },
    async isAdmin(): Promise<boolean> {
      if (isElectron) return window.electronAPI!.system.isAdmin()
      return true
    },
    async requestAdmin(): Promise<{ success: boolean; error?: string | null }> {
      if (isElectron) return window.electronAPI!.system.requestAdmin()
      return { success: true }
    },
    async restartApp(): Promise<{ success: boolean }> {
      if (isElectron) return window.electronAPI!.system.restartApp()
      return { success: true }
    },
  },

  monitor: {
    async getMetrics(): Promise<SystemMetrics> {
      if (isElectron) {
        return window.electronAPI!.monitor.getMetrics()
      }
      const nav = navigator as Navigator & { deviceMemory?: number }
      const used = Math.round(nav.deviceMemory ? (nav.deviceMemory * 1024 * 1024 * 1024) / 3 : 4 * 1024 ** 3)
      return {
        cpu: { usage: Math.round(Math.random() * 40 + 15), clockSpeed: 3.6, cores: navigator.hardwareConcurrency || 4, temperature: 52 },
        memory: {
          used,
          total: (nav.deviceMemory || 16) * 1024 ** 3,
          percentage: Math.round(Math.random() * 30 + 40),
        },
        gpu: { name: 'Simulação GPU', usage: Math.round(Math.random() * 50 + 20), temperature: 61, memoryUsed: 4 * 1024 ** 3, memoryTotal: 8 * 1024 ** 3 },
        disk: { c: { used: 280 * 1024 ** 3, total: 512 * 1024 ** 3, percentage: Math.round(Math.random() * 20 + 50) } },
        network: { download: Math.round(Math.random() * 50 * 1024 * 1024), upload: Math.round(Math.random() * 10 * 1024 * 1024), latency: Math.round(Math.random() * 10 + 8) },
      }
    },
  },

  restore: {
    async list(): Promise<{ success: boolean; points: RestorePoint[]; error?: string | null }> {
      if (isElectron) return window.electronAPI!.restore.list()
      return { success: true, points: [] }
    },
    async create(name: string): Promise<{ success: boolean; error?: string | null }> {
      if (isElectron) return window.electronAPI!.restore.create(name)
      await new Promise((r) => setTimeout(r, 1500))
      return { success: true }
    },
    async restore(seq: number): Promise<{ success: boolean; requiresReboot?: boolean; error?: string | null }> {
      if (isElectron) return window.electronAPI!.restore.restore(seq)
      return { success: true, requiresReboot: true }
    },
  },

  drivers: {
    async list(): Promise<{ success: boolean; drivers: DriverInfo[]; error?: string | null }> {
      if (isElectron) return window.electronAPI!.drivers.list()
      return {
        success: true,
        drivers: [
          { id: 'vga-1', kind: 'vga', name: 'Simulação NVIDIA GeForce RTX', version: '580.94', date: '15/07/2026', provider: 'NVIDIA', downloadUrl: 'https://www.nvidia.com/Download/index.aspx', isLatest: null },
          { id: 'snd-1', kind: 'sound', name: 'Realtek High Definition Audio', version: '6.0.9681.1', date: '10/05/2026', provider: 'Realtek', downloadUrl: 'https://www.realtek.com/Download/List', isLatest: null },
          { id: 'net-1', kind: 'net', name: 'Intel Wi-Fi 6E AX211', version: '23.30.0.4', date: '01/07/2026', provider: 'Intel', downloadUrl: 'https://www.intel.com/content/www/us/en/download-center/home.html', isLatest: null },
        ],
      }
    },
  },

  openExternal: async (url: string) => {
    if (isElectron) return window.electronAPI!.openExternal(url)
    window.open(url, '_blank')
    return { success: true }
  },

  cleanup: {
    async analyze(): Promise<{ success: boolean; bytes: number; error?: string | null }> {
      if (isElectron) return window.electronAPI!.cleanup.analyze()
      return { success: true, bytes: 248 * 1024 * 1024 }
    },
    async run(): Promise<{ success: boolean; bytes: number; error?: string | null }> {
      if (isElectron) return window.electronAPI!.cleanup.run()
      await new Promise((r) => setTimeout(r, 2000))
      return { success: true, bytes: 248 * 1024 * 1024 }
    },
  },
}