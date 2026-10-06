export {}

declare global {
  interface Window {
    electronAPI?: {
      window: {
        minimize: () => void
        maximize: () => void
        close: () => void
        isMaximized: () => Promise<boolean>
        onMaximized: (cb: (maximized: boolean) => void) => () => void
      }
      app: {
        onBeforeClose: (cb: () => void) => () => void
      }
      optimize: {
        run: (command: string) => Promise<{
          success: boolean
          stdout: string
          stderr: string
          error: string | null
        }>
      }
      system: {
        info: () => Promise<import('./index').SystemInfo>
        isAdmin: () => Promise<boolean>
        requestAdmin: () => Promise<{ success: boolean; error?: string | null }>
        restartApp: () => Promise<{ success: boolean }>
      }
      monitor: {
        getMetrics: () => Promise<import('./index').SystemMetrics>
      }
      restore: {
        list: () => Promise<{ success: boolean; points: import('./index').RestorePoint[]; error?: string | null }>
        create: (name: string) => Promise<{ success: boolean; error?: string | null }>
        restore: (seq: number) => Promise<{ success: boolean; requiresReboot?: boolean; error?: string | null }>
      }
      drivers: {
        list: () => Promise<{ success: boolean; drivers: import('./index').DriverInfo[]; error?: string | null }>
      }
      cleanup: {
        analyze: () => Promise<{ success: boolean; bytes: number; error?: string | null }>
        run: () => Promise<{ success: boolean; bytes: number; error?: string | null }>
      }
      openExternal: (url: string) => Promise<{ success: boolean; error?: string | null }>
    }
  }
}