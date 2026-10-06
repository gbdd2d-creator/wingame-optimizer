const { execFile } = require('child_process')

function runPowerShell(script, options = {}) {
  return new Promise((resolve) => {
    const { timeout = 90000, admin = false } = options
    const args = [
      '-NoProfile',
      '-NonInteractive',
      '-ExecutionPolicy', 'Bypass',
      '-Command', script,
    ]

    const child = execFile('powershell.exe', args, {
      timeout,
      windowsHide: true,
      maxBuffer: 10 * 1024 * 1024,
    }, (error, stdout, stderr) => {
      if (error && error.killed) {
        resolve({
          success: false,
          stdout: (stdout || '').trim(),
          stderr: (stderr || '').trim(),
          error: 'O comando excedeu o tempo limite.',
        })
        return
      }
      if (error && error.code === 'EACCES') {
        resolve({
          success: false,
          stdout: (stdout || '').trim(),
          stderr: (stderr || '').trim(),
          error: 'Permissão negada. Execute como Administrador.',
        })
        return
      }
      if (error) {
        resolve({
          success: false,
          stdout: (stdout || '').trim(),
          stderr: (stderr || '').trim(),
          error: error.message || 'Erro ao executar comando.',
        })
        return
      }
      resolve({
        success: true,
        stdout: (stdout || '').trim(),
        stderr: (stderr || '').trim(),
        error: null,
      })
    })
  })
}

function runCommand(command, options = {}) {
  const lines = Array.isArray(command) ? command : command.split('\n')
  const cleanLines = lines
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'))
    .map((l) => {
      if (l.endsWith(';')) return l.slice(0, -1).trim()
      return l
    })

  const script = cleanLines.join('; ')

  if (!script) {
    return Promise.resolve({ success: false, stdout: '', stderr: '', error: 'Comando vazio.' })
  }

  const wrapped = [
    '$ErrorActionPreference = "Continue"',
    'try {',
    '  ' + script,
    '} catch {',
    '  Write-Output ("ERROR: " + $_.Exception.Message)',
    '}',
  ].join('\n')

  return runPowerShell(wrapped, options)
}

function parseOutput(result, markers) {
  const lines = (result.stdout || '').split('\n').map((l) => l.trim())
  const values = {}
  markers.forEach((marker) => {
    const line = lines.find((l) => l.includes(marker))
    if (line) {
      values[marker] = line.split(':').slice(1).join(':').trim()
    }
  })
  return values
}

module.exports = {
  runPowerShell,
  runCommand,
  parseOutput,
}