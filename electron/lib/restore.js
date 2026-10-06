const { runPowerShell } = require('./runner')

async function listRestorePoints() {
  try {
    const script = [
      '$points = Get-ComputerRestorePoint | Sort-Object SequenceNumber -Descending | Select-Object -First 20',
      '$points | ForEach-Object { Write-Output ("POINT|" + $_.SequenceNumber + "|" + $_.Description + "|" + $_.CreationTime.ToString("o")) }',
    ].join('\n')
    const result = await runPowerShell(script, { timeout: 20000 })

    if (!result.success) {
      return { success: false, points: [], error: result.error }
    }

    const points = (result.stdout || '')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.startsWith('POINT|'))
      .map((l) => {
        const [_, seq, description, createdAt] = l.split('|')
        return {
          id: `rp-${seq}`,
          sequenceNumber: parseInt(seq, 10),
          name: description || 'Ponto de restauração',
          description: description || 'Criado pelo sistema',
          createdAt,
        }
      })

    return { success: true, points }
  } catch (e) {
    return { success: false, points: [], error: e.message }
  }
}

async function createRestorePoint(name) {
  const safeName = (name || 'WinGame Optimizer').replace(/[|'"]/g, '').slice(0, 100)
  const script = [
    '$ErrorActionPreference = "Stop"',
    'try {',
    `  Checkpoint-Computer -Description "${safeName}" -RestorePointType MODIFY_SETTINGS -ErrorAction Stop`,
    '  Write-Output "OK"',
    '} catch {',
    '  Write-Output ("ERROR:" + $_.Exception.Message)',
    '}',
  ].join('\n')

  const result = await runPowerShell(script, { timeout: 120000 })

  if (!result.success) {
    return { success: false, error: result.error }
  }
  if ((result.stdout || '').includes('ERROR:')) {
    return { success: false, error: (result.stdout || '').replace('ERROR:', '').trim() }
  }
  return { success: true }
}

async function restoreSystem(sequenceNumber) {
  const seq = parseInt(sequenceNumber, 10)
  if (!seq || isNaN(seq)) {
    return { success: false, error: 'Número de sequência inválido.' }
  }

  const script = [
    '$ErrorActionPreference = "Stop"',
    'try {',
    `  Restore-Computer -RestorePoint ${seq} -Force`,
    '  Write-Output "OK"',
    '} catch {',
    '  Write-Output ("ERROR:" + $_.Exception.Message)',
    '}',
  ].join('\n')

  const result = await runPowerShell(script, { timeout: 30000 })

  if (!result.success) {
    return { success: false, error: result.error }
  }
  if ((result.stdout || '').includes('ERROR:')) {
    return { success: false, error: (result.stdout || '').replace('ERROR:', '').trim() }
  }
  return { success: true, requiresReboot: true }
}

module.exports = {
  listRestorePoints,
  createRestorePoint,
  restoreSystem,
}