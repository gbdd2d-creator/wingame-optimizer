const { contextBridge, ipcRenderer } = require('electron')

const api = {
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
    onMaximized: (cb) => {
      const handler = (_e, val) => cb(val)
      ipcRenderer.on('window:maximized', handler)
      return () => ipcRenderer.removeListener('window:maximized', handler)
    },
  },
  app: {
    onBeforeClose: (cb) => {
      const handler = () => cb()
      ipcRenderer.on('app:before-close', handler)
      return () => ipcRenderer.removeListener('app:before-close', handler)
    },
    confirmClose: () => ipcRenderer.send('app:confirm-close'),
  },
  optimize: {
    run: (command) => ipcRenderer.invoke('optimize:run', command),
  },
  system: {
    info: () => ipcRenderer.invoke('system:info'),
    isAdmin: () => ipcRenderer.invoke('system:isAdmin'),
    requestAdmin: () => ipcRenderer.invoke('system:requestAdmin'),
    restartApp: () => ipcRenderer.invoke('system:restartApp'),
  },
  monitor: {
    getMetrics: () => ipcRenderer.invoke('monitor:getMetrics'),
  },
  restore: {
    list: () => ipcRenderer.invoke('restore:list'),
    create: (name) => ipcRenderer.invoke('restore:create', name),
    restore: (sequenceNumber) => ipcRenderer.invoke('restore:restore', sequenceNumber),
  },
  drivers: {
    list: () => ipcRenderer.invoke('drivers:list'),
  },
  cleanup: {
    analyze: () => ipcRenderer.invoke('cleanup:analyze'),
    run: () => ipcRenderer.invoke('cleanup:run'),
  },
  openExternal: (url) => ipcRenderer.invoke('app:openExternal', url),
}

contextBridge.exposeInMainWorld('electronAPI', api)