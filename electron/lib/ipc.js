const { app, ipcMain, shell } = require('electron')
const { runCommand } = require('./runner')
const monitor = require('./monitor')
const system = require('./system')
const restore = require('./restore')
const drivers = require('./drivers')
const cleanup = require('./cleanup')

module.exports = function registerIpc() {
  // ── Otimizações ─────────────────────────────────────────────
  ipcMain.handle('optimize:run', async (_e, command) => {
    try {
      const result = await runCommand(command, { admin: true })
      return {
        success: result.success,
        stdout: result.stdout,
        stderr: result.stderr,
        error: result.error,
      }
    } catch (err) {
      return { success: false, stdout: '', stderr: '', error: err.message }
    }
  })

  // ── Sistema ─────────────────────────────────────────────────
  ipcMain.handle('system:info', async () => {
    return await system.getSystemInfo()
  })

  ipcMain.handle('system:isAdmin', async () => {
    return system.isAdmin()
  })

  ipcMain.handle('system:requestAdmin', async () => {
    return await system.requestAdmin()
  })

  ipcMain.handle('system:restartApp', async () => {
    app.relaunch()
    app.exit(0)
    return { success: true }
  })

  // ── Monitor ─────────────────────────────────────────────────
  ipcMain.handle('monitor:getMetrics', async () => {
    return await monitor.getMetrics()
  })

  // ── Restauração ─────────────────────────────────────────────
  ipcMain.handle('restore:list', async () => {
    return await restore.listRestorePoints()
  })

  ipcMain.handle('restore:create', async (_e, name) => {
    return await restore.createRestorePoint(name)
  })

  ipcMain.handle('restore:restore', async (_e, seq) => {
    return await restore.restoreSystem(seq)
  })

  // ── Drivers ─────────────────────────────────────────────────
  ipcMain.handle('drivers:list', async () => {
    return await drivers.listDrivers()
  })

  // ── Limpeza ─────────────────────────────────────────────────
  ipcMain.handle('cleanup:analyze', async () => {
    return await cleanup.analyze()
  })

  ipcMain.handle('cleanup:run', async () => {
    return await cleanup.run()
  })

  // ── Externo ─────────────────────────────────────────────────
  ipcMain.handle('app:openExternal', async (_e, url) => {
    if (typeof url === 'string' && /^https?:\/\//i.test(url)) {
      await shell.openExternal(url)
      return { success: true }
    }
    return { success: false, error: 'URL inválida.' }
  })
}