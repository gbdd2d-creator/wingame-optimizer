const { runPowerShell } = require('./runner')

function getVendorDownloadUrl(name, kind) {
  const lower = (name || '').toLowerCase()
  if (lower.includes('nvidia') || lower.includes('geforce')) {
    return 'https://www.nvidia.com/Download/index.aspx'
  }
  if (lower.includes('amd') || lower.includes('radeon') || lower.includes('ati')) {
    return 'https://www.amd.com/en/support'
  }
  if (lower.includes('intel')) {
    if (kind === 'network') return 'https://www.intel.com/content/www/us/en/download-center/home.html'
    return 'https://www.intel.com/content/www/us/en/products/details/discrete-gpus.html'
  }
  if (lower.includes('realtek')) {
    return 'https://www.realtek.com/Download/List'
  }
  if (lower.includes('qualcomm')) {
    return 'https://www.qualcomm.com/products/technology/wifi'
  }
  if (lower.includes('killer') || lower.includes('rivet')) {
    return 'https://www.intel.com/content/www/us/en/download-center/home.html'
  }
  return null
}

async function listDrivers() {
  try {
    const script = [
      '$vga = Get-CimInstance Win32_VideoController | Select-Object -First 1',
      '$sound = Get-CimInstance Win32_SoundDevice | Select-Object -First 1',
      '$net = Get-CimInstance Win32_NetworkAdapter | Where-Object { $_.NetEnabled -eq $true } | Select-Object -First 1',
      'if ($vga) { Write-Output ("VGA|" + $vga.Name + "|" + $vga.DriverVersion + "|" + $vga.DriverDate) }',
      'if ($sound) { Write-Output ("SOUND|" + $sound.Name + "|" + $sound.DriverVersion + "|" + $sound.DriverDate) }',
      'if ($net) { Write-Output ("NET|" + $net.Name + "|" + $net.DriverVersion + "|" + $net.DriverDate) }',
    ].join('\n')

    const result = await runPowerShell(script, { timeout: 20000 })
    if (!result.success) {
      return { success: false, drivers: [], error: result.error }
    }

    const drivers = (result.stdout || '')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.startsWith('VGA|') || l.startsWith('SOUND|') || l.startsWith('NET|'))
      .map((l) => {
        const [kind, name, version, rawDate] = l.split('|')
        const date = formatDriverDate(rawDate)
        return {
          id: `${kind}-${name}`,
          kind: kind.toLowerCase(),
          name: name || 'Dispositivo',
          version: version || 'Desconhecida',
          date,
          provider: getProvider(name),
          downloadUrl: getVendorDownloadUrl(name, kind.toLowerCase()),
          isLatest: null,
        }
      })

    return { success: true, drivers }
  } catch (e) {
    return { success: false, drivers: [], error: e.message }
  }
}

function formatDriverDate(raw) {
  if (!raw) return '—'
  // WMI DriverDate is in 20150101000000.000000-000 format
  const m = String(raw).match(/^(\d{4})(\d{2})(\d{2})/)
  if (m) return `${m[3]}/${m[2]}/${m[1]}`
  const parsed = new Date(raw)
  if (!isNaN(parsed.getTime())) return parsed.toLocaleDateString('pt-BR')
  return String(raw).slice(0, 10)
}

function getProvider(name) {
  const lower = (name || '').toLowerCase()
  if (lower.includes('nvidia')) return 'NVIDIA'
  if (lower.includes('geforce')) return 'NVIDIA'
  if (lower.includes('amd')) return 'AMD'
  if (lower.includes('radeon')) return 'AMD'
  if (lower.includes('intel')) return 'Intel'
  if (lower.includes('realtek')) return 'Realtek'
  if (lower.includes('qualcomm')) return 'Qualcomm'
  if (lower.includes('killer')) return 'Intel'
  return 'Microsoft'
}

module.exports = {
  listDrivers,
  getVendorDownloadUrl,
}