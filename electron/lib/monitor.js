const os = require('os')
const { runPowerShell } = require('./runner')

let lastCpuTimes = null

function getCpuUsage() {
  const cpus = os.cpus()
  if (!lastCpuTimes) {
    lastCpuTimes = {
      idle: cpus.reduce((s, c) => s + c.times.idle, 0),
      total: cpus.reduce((s, c) => s + (c.times.user + c.times.nice + c.times.sys + c.times.idle + c.times.irq), 0),
    }
    return 0
  }

  const idle = cpus.reduce((s, c) => s + c.times.idle, 0)
  const total = cpus.reduce((s, c) => s + (c.times.user + c.times.nice + c.times.sys + c.times.idle + c.times.irq), 0)

  const idleDelta = idle - lastCpuTimes.idle
  const totalDelta = total - lastCpuTimes.total

  lastCpuTimes = { idle, total }

  if (totalDelta <= 0) return 0
  return Math.min(100, Math.max(0, (1 - idleDelta / totalDelta) * 100))
}

function getMemory() {
  const total = os.totalmem()
  const free = os.freemem()
  const used = total - free
  return {
    used,
    total,
    percentage: total > 0 ? (used / total) * 100 : 0,
  }
}

async function getDiskInfo() {
  try {
    const script = [
      '$d = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID=\'C:\'"',
      'if ($d) { Write-Output ("SIZE:" + $d.Size) }',
      'if ($d) { Write-Output ("FREE:" + $d.FreeSpace) }',
    ].join('\n')
    const result = await runPowerShell(script, { timeout: 20000 })
    const lines = (result.stdout || '').split('\n').map((l) => l.trim())
    const size = lines.find((l) => l.startsWith('SIZE:'))?.split(':')[1]
    const free = lines.find((l) => l.startsWith('FREE:'))?.split(':')[1]
    const total = size ? parseFloat(size) : 0
    const freeBytes = free ? parseFloat(free) : 0
    const used = total - freeBytes
    return {
      used: total > 0 ? used : 0,
      total,
      percentage: total > 0 ? (used / total) * 100 : 0,
    }
  } catch {
    return { used: 0, total: 0, percentage: 0 }
  }
}

async function getGpuInfo() {
  let name = 'Desconhecida'
  let usage = 0
  let temperature = undefined
  let memoryUsed = 0
  let memoryTotal = 0

  try {
    const script = [
      '$v = Get-CimInstance Win32_VideoController | Select-Object -First 1',
      'if ($v) { Write-Output ("NAME:" + $v.Name) }',
      'if ($v) { Write-Output ("VRAM:" + $v.AdapterRAM) }',
    ].join('\n')
    const result = await runPowerShell(script, { timeout: 15000 })
    const lines = (result.stdout || '').split('\n').map((l) => l.trim())
    const nameLine = lines.find((l) => l.startsWith('NAME:'))
    const vramLine = lines.find((l) => l.startsWith('VRAM:'))
    if (nameLine) name = nameLine.slice(5).trim()
    if (vramLine) memoryTotal = parseFloat(vramLine.slice(5).trim()) || 0
  } catch {
    // ignore
  }

  // Try nvidia-smi for detailed GPU stats
  try {
    const nvSmi = require('child_process').execFileSync('nvidia-smi.exe', [
      '--query-gpu=utilization.gpu,memory.used,memory.total,temperature.gpu',
      '--format=csv,noheader,nounits',
    ], { timeout: 8000, windowsHide: true, encoding: 'utf8' }).trim()

    const parts = nvSmi.split(',').map((p) => p.trim())
    if (parts.length >= 4) {
      usage = parseFloat(parts[0]) || 0
      memoryUsed = (parseFloat(parts[1]) || 0) * 1024 * 1024
      const totalMb = parseFloat(parts[2]) || 0
      memoryTotal = totalMb * 1024 * 1024
      temperature = parseFloat(parts[3])
    }
  } catch {
    // Not an NVIDIA GPU or nvidia-smi unavailable
  }

  return { name, usage, temperature, memoryUsed, memoryTotal }
}

async function getNetworkInfo() {
  try {
    const script = [
      '$rx = (Get-Counter "\\Network Interface(*)\\Bytes Received/sec" -SampleSet 1 -ErrorAction SilentlyContinue).CounterSamples | Measure-Object -Property CookedValue -Sum',
      '$tx = (Get-Counter "\\Network Interface(*)\\Bytes Sent/sec" -SampleSet 1 -ErrorAction SilentlyContinue).CounterSamples | Measure-Object -Property CookedValue -Sum',
      'if ($rx) { Write-Output ("RX:" + [math]::Round($rx.Sum, 2)) }',
      'if ($tx) { Write-Output ("TX:" + [math]::Round($tx.Sum, 2)) }',
    ].join('\n')
    const result = await runPowerShell(script, { timeout: 25000 })
    const lines = (result.stdout || '').split('\n').map((l) => l.trim())
    const rxLine = lines.find((l) => l.startsWith('RX:'))
    const txLine = lines.find((l) => l.startsWith('TX:'))
    const download = rxLine ? parseFloat(rxLine.slice(3)) || 0 : 0
    const upload = txLine ? parseFloat(txLine.slice(3)) || 0 : 0
    return { download, upload, latency: 0 }
  } catch {
    return { download: 0, upload: 0, latency: 0 }
  }
}

async function getLatency() {
  try {
    const result = await runPowerShell(
      '(Test-Connection 8.8.8.8 -Count 1 -Quiet -ErrorAction SilentlyContinue); (Test-Connection 8.8.8.8 -Count 1 -ErrorAction SilentlyContinue | Measure-Object -Property ResponseTime -Average).Average',
      { timeout: 15000 }
    )
    const avg = parseFloat((result.stdout || '').trim())
    return isNaN(avg) ? 0 : Math.round(avg)
  } catch {
    return 0
  }
}

async function getMetrics() {
  const cpuUsage = getCpuUsage()
  const memory = getMemory()
  const [disk, gpu, network] = await Promise.all([getDiskInfo(), getGpuInfo(), getNetworkInfo()])

  return {
    cpu: {
      usage: cpuUsage,
      clockSpeed: 0,
      cores: os.cpus().length,
      temperature: undefined,
    },
    memory,
    gpu,
    disk: { c: disk },
    network,
    fps: undefined,
    frameTime: undefined,
  }
}

module.exports = {
  getMetrics,
  getCpuUsage,
}