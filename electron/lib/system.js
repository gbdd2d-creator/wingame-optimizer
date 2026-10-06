const os = require('os')
const { execFile } = require('child_process')
const { runPowerShell } = require('./runner')

function isAdmin() {
  try {
    const { execFileSync } = require('child_process')
    execFileSync('net', ['session'], { windowsHide: true, stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

async function getSystemInfo() {
  const info = {
    osName: '',
    osVersion: '',
    osBuild: '',
    cpuName: '',
    cpuCores: 0,
    cpuThreads: 0,
    gpuName: '',
    gpuVendor: 'other',
    ramTotal: 0,
    diskTotal: 0,
    ramUsage: 0,
    diskUsage: 0,
    disks: [],
    architecture: os.arch(),
    hostname: os.hostname(),
    bootTime: '',
  }

  try {
    const script = [
      '$os = Get-CimInstance Win32_OperatingSystem',
      '$cpu = Get-CimInstance Win32_Processor | Select-Object -First 1',
      '$gpu = Get-CimInstance Win32_VideoController | Select-Object -First 1',
      '$ram = (Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory',
      '$disks = Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3"',
      'Write-Output ("OSNAME:" + $os.Caption)',
      'Write-Output ("OSVERSION:" + $os.Version)',
      'Write-Output ("OSBUILD:" + $os.BuildNumber)',
      'Write-Output ("CPUNAME:" + $cpu.Name)',
      'Write-Output ("GPUNMAE:" + $gpu.Name)',
      'Write-Output ("RAMSIZE:" + $ram)',
      '$disks | ForEach-Object {',
      '  $size = $_.Size',
      '  $free = $_.FreeSpace',
      '  Write-Output ("DISK|" + $_.DeviceID + "|" + $_.VolumeName + "|" + $size + "|" + $free)',
      '}',
      'Write-Output ("BOOTTIME:" + $os.LastBootUpTime.ToString("o"))',
    ].join('\n')

    const result = await runPowerShell(script, { timeout: 30000 })
    const lines = (result.stdout || '').split('\n').map((l) => l.trim())
    const get = (marker) => {
      const line = lines.find((l) => l.startsWith(marker))
      return line ? line.slice(marker.length).trim() : ''
    }

    info.osName = get('OSNAME:')
    info.osVersion = get('OSVERSION:')
    info.osBuild = get('OSBUILD:')
    info.cpuName = get('CPUNAME:')
    info.gpuName = get('GPUNMAE:')
    const gpuNameLower = (info.gpuName || '').toLowerCase()
    if (gpuNameLower.includes('nvidia')) info.gpuVendor = 'nvidia'
    else if (gpuNameLower.includes('radeon') || gpuNameLower.includes('amd')) info.gpuVendor = 'amd'
    else if (gpuNameLower.includes('intel')) info.gpuVendor = 'intel'
    else info.gpuVendor = 'other'
    info.ramTotal = parseFloat(get('RAMSIZE:')) || 0
    info.bootTime = get('BOOTTIME:')

    info.disks = lines
      .filter((l) => l.startsWith('DISK|'))
      .map((l) => {
        const parts = l.split('|')
        const size = parseFloat(parts[3]) || 0
        const free = parseFloat(parts[4]) || 0
        return {
          device: (parts[1] || '').replace(':', ''),
          label: parts[2] || '',
          size,
          free,
          usage: size > 0 ? ((size - free) / size) * 100 : 0,
        }
      })
      .filter((d) => d.size > 0)

    const cDisk = info.disks.find((d) => d.device.toUpperCase() === 'C')
    info.diskTotal = cDisk ? cDisk.size : 0
    info.diskUsage = cDisk ? cDisk.usage : 0

    info.cpuCores = os.cpus().length
    info.cpuThreads = os.cpus().length

    const total = os.totalmem()
    const free = os.freemem()
    info.ramUsage = total > 0 ? ((total - free) / total) * 100 : 0
  } catch {
    // ignore
  }

  return info
}

function requestAdmin() {
  return new Promise((resolve) => {
    const { exec } = require('child_process')
    const script = `Start-Process -FilePath '${process.execPath}' -Verb RunAs -ArgumentList '${process.argv.slice(1).join(' ')}'`
    exec(`powershell.exe -NoProfile -Command "${script.replace(/"/g, '\\"')}"`, {
      windowsHide: true,
    }, (error) => {
      resolve({ success: !error, error: error ? error.message : null })
    })
  })
}

module.exports = {
  isAdmin,
  getSystemInfo,
  requestAdmin,
}