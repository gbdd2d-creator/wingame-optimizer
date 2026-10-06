export type OptimizationCategory =
  | 'system'
  | 'network'
  | 'gpu'
  | 'power'
  | 'debloat'
  | 'services'
  | 'storage'
  | 'privacy'

export type OptimizationProfile = 'competitive' | 'casual' | 'streaming'

export type RiskLevel = 'low' | 'medium' | 'high'
export type ImpactLevel = 'low' | 'medium' | 'high'
export type GpuVendor = 'nvidia' | 'amd' | 'intel' | 'other'
export type GpuVendorPref = 'auto' | 'nvidia' | 'amd' | 'intel'

export interface OptimizationItem {
  id: string
  title: string
  description: string
  category: OptimizationCategory
  risk: RiskLevel
  impact: ImpactLevel
  requiresRestart: boolean
  requiresAdmin: boolean
  vendor?: GpuVendor
  command: string
  revertCommand: string
  tags: string[]
  profiles: OptimizationProfile[]
}

export interface CategoryInfo {
  id: OptimizationCategory
  label: string
  description: string
  icon: string
}

export interface DiskInfo {
  device: string
  label: string
  size: number
  free: number
  usage: number
}

export interface SystemInfo {
  osName: string
  osVersion: string
  osBuild: string
  cpuName: string
  cpuCores: number
  cpuThreads: number
  gpuName: string
  gpuVendor: GpuVendor
  ramTotal: number
  ramUsage: number
  diskTotal: number
  diskUsage: number
  disks: DiskInfo[]
  architecture: string
  hostname: string
  bootTime: string
}

export interface SystemMetrics {
  cpu: {
    usage: number
    clockSpeed: number
    cores: number
    temperature?: number
  }
  memory: {
    used: number
    total: number
    percentage: number
  }
  gpu: {
    name: string
    usage: number
    temperature?: number
    memoryUsed: number
    memoryTotal: number
  }
  disk: {
    c: { used: number; total: number; percentage: number }
  }
  network: {
    download: number
    upload: number
    latency: number
  }
  fps?: number
  frameTime?: number
}

export interface DriverInfo {
  id: string
  kind: 'vga' | 'sound' | 'net'
  name: string
  version: string
  date: string
  provider: string
  downloadUrl: string | null
  isLatest: boolean | null
}

export interface RestorePoint {
  id: string
  sequenceNumber: number
  name: string
  description: string
  createdAt: string
}

export interface OptimizationResult {
  success: boolean
  message: string
  requiresRestart: boolean
  appliedAt?: string
}

export interface ProfileConfig {
  id: OptimizationProfile
  name: string
  description: string
  icon: string
  color: string
  accent: string
}

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export type PageId =
  | 'dashboard'
  | 'optimize'
  | 'profiles'
  | 'monitor'
  | 'cleanup'
  | 'tools'
  | 'settings'

export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  autoBackup: boolean
  showNotifications: boolean
  onboardingSeen: boolean
  gpuVendorPref: GpuVendorPref
}