import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  OptimizationItem,
  OptimizationCategory,
  OptimizationProfile,
  SystemMetrics,
  DriverInfo,
  RestorePoint,
  OptimizationResult,
  ToastMessage,
  SystemInfo,
  AppSettings,
} from '@/types'

// ── Navegação ──────────────────────────────────────────────
export type PageId = 'dashboard' | 'optimize' | 'profiles' | 'monitor' | 'cleanup' | 'tools' | 'settings'

interface NavState {
  page: PageId
  category: OptimizationCategory | 'all'
  setPage: (page: PageId) => void
  setCategory: (category: OptimizationCategory | 'all') => void
}

export const useNavStore = create<NavState>((set) => ({
  page: 'dashboard',
  category: 'all',
  setPage: (page) => set({ page }),
  setCategory: (category) => set({ category }),
}))

// ── Otimizações ────────────────────────────────────────────
interface OptimizationState {
  items: OptimizationItem[]
  results: Record<string, OptimizationResult>
  isApplying: boolean
  applyingId: string | null
  adminMode: boolean
  setItems: (items: OptimizationItem[]) => void
  apply: (item: OptimizationItem) => Promise<OptimizationResult>
  revert: (item: OptimizationItem) => Promise<OptimizationResult>
  reset: (id: string) => void
  clearResults: () => void
  clearRestartFlags: () => void
  setAdminMode: (admin: boolean) => void
}

export const useOptimizationStore = create<OptimizationState>()(
  persist(
    (set, get) => ({
      items: [],
      results: {},
      isApplying: false,
      applyingId: null,
      adminMode: false,

      setItems: (items) => set({ items }),
      setAdminMode: (adminMode) => set({ adminMode }),

      apply: async (item) => {
        set({ isApplying: true, applyingId: item.id })
        try {
          const { bridge } = await import('@/lib/bridge')
          const isAdmin = await bridge.system.isAdmin()
          const res = await bridge.optimize.run(item.command)
          const success = res.success
          const result: OptimizationResult = {
            success,
            message: success
              ? 'Otimização aplicada com sucesso.' + (item.requiresRestart ? ' Reinicialize o PC para aplicar completamente.' : '')
              : `Falha: ${res.error || res.stderr || res.stdout || 'Erro desconhecido'}`,
            requiresRestart: success && item.requiresRestart,
            appliedAt: new Date().toISOString(),
          }
          set((state) => ({ results: { ...state.results, [item.id]: result } }))
          if (!isAdmin && item.requiresAdmin) {
            set((state) => ({ results: { ...state.results, [item.id]: { ...result, success: false, message: 'Esta otimização requer execução como Administrador.' } } }))
          }
          return result
        } finally {
          set({ isApplying: false, applyingId: null })
        }
      },

      revert: async (item) => {
        set({ isApplying: true, applyingId: item.id })
        try {
          if (!item.revertCommand) {
            const result: OptimizationResult = {
              success: true,
              message: 'Esta otimização não possui reversão automática. Restaure manualmente ou crie um ponto de restauração.',
              requiresRestart: false,
              appliedAt: new Date().toISOString(),
            }
            set((state) => {
              const { [item.id]: _removed, ...rest } = state.results
              return { results: rest }
            })
            return result
          }
          const { bridge } = await import('@/lib/bridge')
          const res = await bridge.optimize.run(item.revertCommand)
          const result: OptimizationResult = {
            success: res.success,
            message: res.success ? 'Revertido com sucesso.' : `Falha ao reverter: ${res.error || res.stdout || ''}`,
            requiresRestart: false,
            appliedAt: new Date().toISOString(),
          }
          if (result.success) {
            set((state) => {
              const { [item.id]: _removed, ...rest } = state.results
              return { results: rest }
            })
          }
          return result
        } finally {
          set({ isApplying: false, applyingId: null })
        }
      },

      reset: (id) =>
        set((state) => {
          const { [id]: _removed, ...rest } = state.results
          return { results: rest }
        }),

      clearResults: () => set({ results: {} }),
      clearRestartFlags: () =>
        set((state) => ({
          results: Object.fromEntries(
            Object.entries(state.results).map(([id, r]) => [
              id,
              r.requiresRestart ? { ...r, requiresRestart: false } : r,
            ])
          ),
        })),
    }),
    {
      name: 'wingame-optimization',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ results: state.results }),
    }
  )
)

// ── Perfis ─────────────────────────────────────────────────
interface ProfileState {
  activeProfile: OptimizationProfile | null
  setActiveProfile: (profile: OptimizationProfile | null) => void
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      activeProfile: null,
      setActiveProfile: (activeProfile) => set({ activeProfile }),
    }),
    {
      name: 'wingame-profile',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// ── Monitor ────────────────────────────────────────────────
interface MetricsState {
  metrics: SystemMetrics | null
  history: SystemMetrics[]
  isMonitoring: boolean
  interval: number
  setMetrics: (metrics: SystemMetrics) => void
  addHistory: (metrics: SystemMetrics) => void
  setMonitoring: (monitoring: boolean) => void
  setInterval: (interval: number) => void
  clearHistory: () => void
}

export const useMetricsStore = create<MetricsState>()(
  persist(
    (set) => ({
      metrics: null,
      history: [],
      isMonitoring: false,
      interval: 2000,
      setMetrics: (metrics) => set({ metrics }),
      addHistory: (metrics) =>
        set((state) => ({ history: [...state.history.slice(-119), metrics] })),
      setMonitoring: (isMonitoring) => set({ isMonitoring }),
      setInterval: (interval) => set({ interval }),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'wingame-monitor',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ interval: state.interval }),
    }
  )
)

// ── Sistema ────────────────────────────────────────────────
interface SystemState {
  info: SystemInfo | null
  isAdmin: boolean
  loaded: boolean
  setInfo: (info: SystemInfo) => void
  setAdmin: (admin: boolean) => void
  setLoaded: (loaded: boolean) => void
}

export const useSystemStore = create<SystemState>((set) => ({
  info: null,
  isAdmin: false,
  loaded: false,
  setInfo: (info) => set({ info }),
  setAdmin: (isAdmin) => set({ isAdmin }),
  setLoaded: (loaded) => set({ loaded }),
}))

// ── Restauração ────────────────────────────────────────────
interface RestoreState {
  restorePoints: RestorePoint[]
  loadingRestore: boolean
  setRestorePoints: (points: RestorePoint[]) => void
  setLoadingRestore: (loading: boolean) => void
}

export const useRestoreStore = create<RestoreState>((set) => ({
  restorePoints: [],
  loadingRestore: false,
  setRestorePoints: (restorePoints) => set({ restorePoints }),
  setLoadingRestore: (loadingRestore) => set({ loadingRestore }),
}))

// ── Ferramentas (drivers) ──────────────────────────────────
interface ToolsState {
  drivers: DriverInfo[]
  loadingDrivers: boolean
  lastDriverCheck: string | null
  setDrivers: (drivers: DriverInfo[]) => void
  setLoadingDrivers: (loading: boolean) => void
  setLastDriverCheck: (date: string) => void
}

export const useToolsStore = create<ToolsState>((set) => ({
  drivers: [],
  loadingDrivers: false,
  lastDriverCheck: null,
  setDrivers: (drivers) => set({ drivers }),
  setLoadingDrivers: (loadingDrivers) => set({ loadingDrivers }),
  setLastDriverCheck: (lastDriverCheck) => set({ lastDriverCheck }),
}))

// ── Toasts ─────────────────────────────────────────────────
interface ToastState {
  toasts: ToastMessage[]
  addToast: (toast: Omit<ToastMessage, 'id'>) => void
  removeToast: (id: string) => void
  clear: () => void
}

let toastCounter = 0

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: `toast-${++toastCounter}` }],
    })),
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}))

// ── Configurações ──────────────────────────────────────────
const defaultSettings: AppSettings = {
  theme: 'dark',
  autoBackup: true,
  showNotifications: true,
  onboardingSeen: false,
  gpuVendorPref: 'auto',
}

interface SettingsState {
  settings: AppSettings
  setSettings: (settings: Partial<AppSettings>) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      setSettings: (partial) =>
        set((state) => ({ settings: { ...state.settings, ...partial } })),
    }),
    {
      name: 'wingame-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
)