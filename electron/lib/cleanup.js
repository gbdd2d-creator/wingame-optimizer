const { runPowerShell } = require('./runner')

const CLEAN_PATHS = [
  '"$env:TEMP"',
  '"$env:SystemRoot\\Temp"',
  '"$env:SystemRoot\\SoftwareDistribution\\Download"',
]

function sizeScript(varName) {
  return [
    `$${varName} = 0`,
    'foreach ($p in $paths) {',
    '  if (Test-Path -LiteralPath $p) {',
    `    $s = (Get-ChildItem -LiteralPath $p -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum`,
    `    if ($s) { $${varName} += $s }`,
    '  }',
    '}',
  ].join('\n')
}

async function analyze() {
  const script = [
    `$paths = @(${CLEAN_PATHS.join(', ')})`,
    sizeScript('total'),
    'Write-Output ("TOTAL:" + [math]::Round($total))',
  ].join('\n')

  const result = await runPowerShell(script, { timeout: 90000 })
  if (!result.success) {
    return { success: false, bytes: 0, error: result.error || result.stderr }
  }

  const match = (result.stdout || '').match(/TOTAL:\s*(\d+)/)
  const bytes = match ? parseInt(match[1], 10) : 0
  return { success: true, bytes: isNaN(bytes) ? 0 : bytes, error: null }
}

async function run() {
  const script = [
    `$paths = @(${CLEAN_PATHS.join(', ')})`,
    sizeScript('before'),
    'foreach ($p in $paths) {',
    '  if (Test-Path -LiteralPath $p) {',
    '    Get-ChildItem -LiteralPath $p -Force -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue',
    '  }',
    '}',
    sizeScript('after'),
    'Write-Output ("FREED:" + [math]::Round($before - $after))',
  ].join('\n')

  const result = await runPowerShell(script, { timeout: 180000 })
  if (!result.success) {
    return { success: false, bytes: 0, error: result.error || result.stderr }
  }

  const match = (result.stdout || '').match(/FREED:\s*(-?\d+)/)
  const bytes = match ? parseInt(match[1], 10) : 0
  return { success: true, bytes: Math.max(0, isNaN(bytes) ? 0 : bytes), error: null }
}

module.exports = { analyze, run }