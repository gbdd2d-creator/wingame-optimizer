import type {
  CategoryInfo,
  OptimizationItem,
  OptimizationCategory,
  ProfileConfig,
} from '@/types'

export const categories: CategoryInfo[] = [
  {
    id: 'system',
    label: 'Sistema',
    description: 'Ajustes gerais do Windows para reduzir overhead e melhorar responsividade.',
    icon: 'Cpu',
  },
  {
    id: 'network',
    label: 'Rede',
    description: 'Reduza latência, otimize TCP, DNS e prioridade de rede para jogos online.',
    icon: 'Wifi',
  },
  {
    id: 'gpu',
    label: 'GPU',
    description: 'Agendamento de GPU, drivers e parâmetros de gráficos.',
    icon: 'MonitorPlay',
  },
  {
    id: 'power',
    label: 'Energia',
    description: 'Plano de alto desempenho, CPU em 100% e desativar economia de energia.',
    icon: 'Zap',
  },
  {
    id: 'debloat',
    label: 'Debloat',
    description: 'Remova aplicativos pré-instalados e desnecessários do Windows.',
    icon: 'Trash2',
  },
  {
    id: 'services',
    label: 'Serviços',
    description: 'Desative serviços em segundo plano que consomem CPU e memória.',
    icon: 'Server',
  },
  {
    id: 'storage',
    label: 'Armazenamento',
    description: 'Otimize SSD/HDD, prefetch e melhore o acesso a disco.',
    icon: 'HardDrive',
  },
  {
    id: 'privacy',
    label: 'Privacidade',
    description: 'Reduza telemetria, rastreamento e coleta de dados do Windows.',
    icon: 'ShieldCheck',
  },
]

export const profiles: ProfileConfig[] = [
  {
    id: 'competitive',
    name: 'Competitivo',
    description: 'Máximo FPS e menor latência. Prioriza performance acima de tudo.',
    icon: 'Target',
    color: 'text-red-400',
    accent: 'from-red-500/20 to-transparent',
  },
  {
    id: 'casual',
    name: 'Casual',
    description: 'Equilíbrio entre performance e estabilidade do sistema.',
    icon: 'Gamepad2',
    color: 'text-emerald-400',
    accent: 'from-emerald-500/20 to-transparent',
  },
  {
    id: 'streaming',
    name: 'Streaming',
    description: 'Otimizado para jogar e transmitir ao mesmo tempo com estabilidade.',
    icon: 'Radio',
    color: 'text-purple-400',
    accent: 'from-purple-500/20 to-transparent',
  },
]

export const optimizations: OptimizationItem[] = [
  // ═══════════════════════ SISTEMA ═══════════════════════
  {
    id: 'sys-game-dvr',
    title: 'Desativar Game DVR e Captura de Jogos',
    description:
      'Desativa a gravação em segundo plano do Xbox Game DVR. O Windows fica constantemente gravando um buffer de vídeo dos seus jogos, usando CPU, GPU e memória mesmo quando você não está gravando. Desativar isso libera recursos e pode aumentar o FPS.',
    category: 'system',
    risk: 'low',
    impact: 'medium',
    requiresRestart: true,
    requiresAdmin: false,
    command:
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\GameDVR" /v AppCaptureEnabled /t REG_DWORD /d 0 /f; reg add "HKCU\\System\\GameConfigStore" /v GameDVR_Enabled /t REG_DWORD /d 0 /f',
    revertCommand:
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\GameDVR" /v AppCaptureEnabled /t REG_DWORD /d 1 /f; reg add "HKCU\\System\\GameConfigStore" /v GameDVR_Enabled /t REG_DWORD /d 1 /f',
    tags: ['FPS', 'GPU'],
    profiles: ['competitive', 'casual', 'streaming'],
  },
  {
    id: 'sys-game-bar',
    title: 'Desativar Xbox Game Bar',
    description:
      'Desativa a barra de jogos do Xbox (Win+G). Ela roda serviços em segundo plano constantemente. Se você não usa gravação, capturas ou widgets dela, desativar reduz o uso de recursos durante os jogos.',
    category: 'system',
    risk: 'low',
    impact: 'low',
    requiresRestart: true,
    requiresAdmin: false,
    command:
      'reg add "HKCU\\Software\\Microsoft\\GameBar" /v AutoGameModeEnabled /t REG_DWORD /d 0 /f; reg add "HKCU\\Software\\Microsoft\\GameBar" /v AllowAutoGameMode /t REG_DWORD /d 0 /f',
    revertCommand:
      'reg add "HKCU\\Software\\Microsoft\\GameBar" /v AutoGameModeEnabled /t REG_DWORD /d 1 /f; reg add "HKCU\\Software\\Microsoft\\GameBar" /v AllowAutoGameMode /t REG_DWORD /d 1 /f',
    tags: ['FPS', 'Sistema'],
    profiles: ['competitive'],
  },
  {
    id: 'sys-games-priority',
    title: 'Prioridade Alta para Jogos (MMCSS)',
    description:
      'Define a classe de agendamento "Games" do Windows como Alta prioridade e desativa o gerenciamento de tarefas em segundo plano. Isso faz com que o Windows priorize jogos sobre outros processos, reduzindo quedas de FPS causadas por tarefas concorrentes.',
    category: 'system',
    risk: 'medium',
    impact: 'high',
    requiresRestart: true,
    requiresAdmin: false,
    command:
      'reg add "HKCU\\Software\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games" /v "GPU Priority" /t REG_DWORD /d 8 /f; reg add "HKCU\\Software\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games" /v "Priority" /t REG_DWORD /d 6 /f; reg add "HKCU\\Software\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games" /v "Scheduling Category" /t REG_SZ /d "High" /f',
    revertCommand:
      'reg add "HKCU\\Software\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games" /v "GPU Priority" /t REG_DWORD /d 4 /f; reg add "HKCU\\Software\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games" /v "Priority" /t REG_DWORD /d 2 /f; reg add "HKCU\\Software\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games" /v "Scheduling Category" /t REG_SZ /d "Medium" /f',
    tags: ['FPS', 'CPU'],
    profiles: ['competitive', 'streaming'],
  },
  {
    id: 'sys-system-responsiveness',
    title: 'Máxima Responsividade do Sistema',
    description:
      'Reduz o percentual de recursos que o Windows reserva para tarefas em segundo plano (SystemResponsiveness) para 0%. Em conjunto com a prioridade de jogos, isso direciona mais tempo de CPU e GPU para o seu jogo. Efeito mais perceptível em CPUs de poucos núcleos.',
    category: 'system',
    risk: 'medium',
    impact: 'high',
    requiresRestart: true,
    requiresAdmin: true,
    command:
      'reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile" /v SystemResponsiveness /t REG_DWORD /d 0 /f',
    revertCommand:
      'reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile" /v SystemResponsiveness /t REG_DWORD /d 20 /f',
    tags: ['CPU', 'FPS'],
    profiles: ['competitive'],
  },
  {
    id: 'sys-mouse-accel',
    title: 'Desativar Aceleração do Mouse',
    description:
      'Desativa a precisão aprimorada do ponteiro (aceleração do mouse). Em jogos competitivos de tiro, a aceleração adiciona movimento imprevisível ao cursor. Desativar garante movimento 1:1 com o seu mouse, essencial para precisão em jogos de mira.',
    category: 'system',
    risk: 'low',
    impact: 'medium',
    requiresRestart: false,
    requiresAdmin: false,
    command:
      'reg add "HKCU\\Control Panel\\Mouse" /v MouseSpeed /t REG_SZ /d 0 /f; reg add "HKCU\\Control Panel\\Mouse" /v MouseThreshold1 /t REG_SZ /d 0 /f; reg add "HKCU\\Control Panel\\Mouse" /v MouseThreshold2 /t REG_SZ /d 0 /f',
    revertCommand:
      'reg add "HKCU\\Control Panel\\Mouse" /v MouseSpeed /t REG_SZ /d 1 /f; reg add "HKCU\\Control Panel\\Mouse" /v MouseThreshold1 /t REG_SZ /d 6 /f; reg add "HKCU\\Control Panel\\Mouse" /v MouseThreshold2 /t REG_SZ /d 10 /f',
    tags: ['Precisão', 'Competitivo'],
    profiles: ['competitive'],
  },
  {
    id: 'sys-background-apps',
    title: 'Desativar Aplicativos em Segundo Plano',
    description:
      'Bloqueia a execução de aplicativos em segundo plano da Microsoft Store e do sistema. Muitos apps ficam rodando silenciosamente consumindo CPU, memória e rede. Desativar libera recursos para seus jogos.',
    category: 'system',
    risk: 'low',
    impact: 'medium',
    requiresRestart: false,
    requiresAdmin: false,
    command:
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\BackgroundAccessApplications" /v GlobalUserDisabled /t REG_DWORD /d 1 /f',
    revertCommand:
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\BackgroundAccessApplications" /v GlobalUserDisabled /t REG_DWORD /d 0 /f',
    tags: ['RAM', 'CPU'],
    profiles: ['competitive', 'casual', 'streaming'],
  },
  {
    id: 'sys-visual-effects',
    title: 'Efeitos Visuais em Modo Performance',
    description:
      'Configura o Windows para priorizar o desempenho em vez de efeitos visuais (animações, transparências, sombras). O sistema fica mais leve e responsivo, especialmente útil em PCs mais modestos.',
    category: 'system',
    risk: 'low',
    impact: 'low',
    requiresRestart: false,
    requiresAdmin: false,
    command:
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\VisualEffects" /v VisualFXSetting /t REG_DWORD /d 2 /f',
    revertCommand:
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\VisualEffects" /v VisualFXSetting /t REG_DWORD /d 3 /f',
    tags: ['Responsividade'],
    profiles: ['casual'],
  },

  // ═══════════════════════ REDE ═══════════════════════
  {
    id: 'net-tcp-autotuning',
    title: 'Otimizar TCP Auto-Tuning',
    description:
      'Configura o algoritmo de controle de congestionamento TCP do Windows para o nível "normal". Isso melhora a transferência de dados da rede e reduz inconsistências de latência em jogos online, especialmente em conexões com perda de pacotes.',
    category: 'network',
    risk: 'low',
    impact: 'medium',
    requiresRestart: false,
    requiresAdmin: true,
    command: 'netsh int tcp set global autotuninglevel=normal',
    revertCommand: 'netsh int tcp set global autotuninglevel=normal',
    tags: ['Latência', 'TCP'],
    profiles: ['competitive', 'casual', 'streaming'],
  },
  {
    id: 'net-rss',
    title: 'Ativar Receive-Side Scaling (RSS)',
    description:
      'Habilita o RSS, que distribui o processamento de pacotes de rede entre vários núcleos da CPU. Isso melhora o throughput de rede em conexões rápidas e reduz o uso de CPU no processamento de pacotes durante jogos online.',
    category: 'network',
    risk: 'low',
    impact: 'medium',
    requiresRestart: false,
    requiresAdmin: true,
    command: 'netsh int tcp set global rss=enabled',
    revertCommand: 'netsh int tcp set global rss=disabled',
    tags: ['Rede', 'CPU'],
    profiles: ['competitive', 'streaming'],
  },
  {
    id: 'net-throttling',
    title: 'Remover Limite de Rede (Network Throttling)',
    description:
      'Remove o limite de largura de banda que o Windows impõe ao tráfego de rede de aplicativos de mídia (throttling). Isso reduz o atraso de rede em jogos e evita quedas de prioridade quando outros programas usam a rede.',
    category: 'network',
    risk: 'low',
    impact: 'high',
    requiresRestart: false,
    requiresAdmin: false,
    command:
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Multimedia\\SystemProfile" /v NetworkThrottlingIndex /t REG_DWORD /d 0xffffffff /f',
    revertCommand:
      'reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Multimedia\\SystemProfile" /v NetworkThrottlingIndex /f',
    tags: ['Latência', 'Ping'],
    profiles: ['competitive', 'casual', 'streaming'],
  },
  {
    id: 'net-dns-cloudflare',
    title: 'DNS Rápido (Cloudflare 1.1.1.1)',
    description:
      'Configura seu adaptador de rede ativo para usar o DNS do Cloudflare (1.1.1.1), um dos DNS mais rápidos do mundo. Isso pode reduzir o tempo de resolução de nomes, diminuindo o tempo de conexão aos servidores de jogos.',
    category: 'network',
    risk: 'medium',
    impact: 'medium',
    requiresRestart: false,
    requiresAdmin: true,
    command:
      '$iface = Get-NetAdapter | Where-Object { $_.Status -eq "Up" } | Select-Object -First 1; if ($iface) { Set-DnsClientServerAddress -InterfaceIndex $iface.ifIndex -ServerAddresses ("1.1.1.1","1.0.0.1") -ErrorAction SilentlyContinue; Write-Output ("DNS configurado em: " + $iface.Name) } else { Write-Output "ERROR:Nenhum adaptador ativo encontrado" }',
    revertCommand:
      '$iface = Get-NetAdapter | Where-Object { $_.Status -eq "Up" } | Select-Object -First 1; if ($iface) { Set-DnsClientServerAddress -InterfaceIndex $iface.ifIndex -ResetServerAddresses -ErrorAction SilentlyContinue }',
    tags: ['DNS', 'Ping'],
    profiles: ['competitive', 'casual', 'streaming'],
  },
  {
    id: 'net-nagle-off',
    title: 'Desativar Algoritmo de Nagle',
    description:
      'Desativa o algoritmo de Nagle e o atraso de ACK (TcpAckFrequency) em todas as interfaces de rede. Esses mecanismos acumulam pequenos pacotes para economizar banda, mas adicionam latência a jogos. Desativar reduz o ping, principalmente em jogos de tiro competitivos.',
    category: 'network',
    risk: 'medium',
    impact: 'high',
    requiresRestart: true,
    requiresAdmin: true,
    command:
      '$interfaces = Get-ChildItem "HKLM:\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters\\Interfaces" -ErrorAction SilentlyContinue; foreach ($i in $interfaces) { New-ItemProperty -Path $i.PSPath -Name TCPNoDelay -Value 1 -PropertyType DWord -Force | Out-Null; New-ItemProperty -Path $i.PSPath -Name TcpAckFrequency -Value 1 -PropertyType DWord -Force | Out-Null }; Write-Output "Nagle desativado em todas as interfaces"',
    revertCommand:
      '$interfaces = Get-ChildItem "HKLM:\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters\\Interfaces" -ErrorAction SilentlyContinue; foreach ($i in $interfaces) { Remove-ItemProperty -Path $i.PSPath -Name TCPNoDelay -ErrorAction SilentlyContinue; Remove-ItemProperty -Path $i.PSPath -Name TcpAckFrequency -ErrorAction SilentlyContinue }; Write-Output "Configurações de Nagle revertidas"',
    tags: ['Ping', 'TCP'],
    profiles: ['competitive'],
  },

  // ═══════════════════════ GPU ═══════════════════════
  {
    id: 'gpu-hw-scheduling',
    title: 'Ativar Agendamento Acelerado por Hardware (GPU)',
    description:
      'Ativa o Hardware-Accelerated GPU Scheduling do Windows. Com ele, a GPU gerencia sua própria memória em vez de depender da CPU, reduzindo a latência de renderização e melhorando o desempenho em jogos que exigem muito da GPU.',
    category: 'gpu',
    risk: 'medium',
    impact: 'high',
    requiresRestart: true,
    requiresAdmin: true,
    command:
      'reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\GraphicsDrivers" /v HwSchMode /t REG_DWORD /d 2 /f',
    revertCommand:
      'reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\GraphicsDrivers" /v HwSchMode /t REG_DWORD /d 1 /f',
    tags: ['GPU', 'Latência'],
    profiles: ['competitive', 'casual', 'streaming'],
  },
  {
    id: 'gpu-tdr-delay',
    title: 'Aumentar Timeout do Driver de Vídeo (TDR)',
    description:
      'Aumenta o tempo que o Windows espera antes de considerar que o driver de vídeo travou (TDR timeout). Isso evita o erro "driver parou de responder" durante picos de carga em jogos pesados ou overclock de GPU, reduzindo crashes e tela preta.',
    category: 'gpu',
    risk: 'high',
    impact: 'medium',
    requiresRestart: true,
    requiresAdmin: true,
    command:
      'reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\GraphicsDrivers" /v TdrDelay /t REG_DWORD /d 10 /f',
    revertCommand:
      'reg delete "HKLM\\SYSTEM\\CurrentControlSet\\Control\\GraphicsDrivers" /v TdrDelay /f',
    tags: ['Estabilidade', 'GPU'],
    profiles: ['casual', 'streaming'],
  },
  {
    id: 'gpu-tdr-ddi',
    title: 'Aumentar Timeout de Operações da GPU (TdrDdiDelay)',
    description:
      'Aumenta o tempo máximo para operações de longa duração da GPU antes do watchdog do Windows agir. Útil para quem faz overclock de GPU ou usa cargas de trabalho gráficas intensas, prevenindo resets inesperados do driver.',
    category: 'gpu',
    risk: 'high',
    impact: 'medium',
    requiresRestart: true,
    requiresAdmin: true,
    command:
      'reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\GraphicsDrivers" /v TdrDdiDelay /t REG_DWORD /d 30 /f',
    revertCommand:
      'reg delete "HKLM\\SYSTEM\\CurrentControlSet\\Control\\GraphicsDrivers" /v TdrDdiDelay /f',
    tags: ['Overclock', 'GPU'],
    profiles: ['competitive'],
  },
  {
    id: 'gpu-opencl-gl',
    title: 'Ativar Aceleração OpenGL por Hardware',
    description:
      'Define o máximo de aplicações OpenGL a serem aceleradas por hardware no registro do DirectX (OpenGLSafeFlags = 0). Pode melhorar o desempenho de jogos e apps que usam OpenGL em vez de DirectX.',
    category: 'gpu',
    risk: 'low',
    impact: 'low',
    requiresRestart: false,
    requiresAdmin: false,
    command:
      'reg add "HKCU\\Software\\Microsoft\\DirectX" /v OpenGLSafeFlags /t REG_DWORD /d 0 /f',
    revertCommand:
      'reg delete "HKCU\\Software\\Microsoft\\DirectX" /v OpenGLSafeFlags /f',
    tags: ['OpenGL'],
    profiles: ['casual'],
  },
  {
    id: 'gpu-nvidia-persistence',
    title: 'Modo de Persistência da GPU (NVIDIA)',
    description:
      'Ativa o modo de persistência do driver NVIDIA (nvidia-smi -pm 1), mantendo o driver carregado na memória mesmo quando a GPU não está em uso. Isso elimina a espera de inicialização do driver ao abrir jogos, reduzindo engasgos no início e melhorando a responsividade. Exige GPU NVIDIA.',
    category: 'gpu',
    risk: 'low',
    impact: 'medium',
    requiresRestart: false,
    requiresAdmin: true,
    vendor: 'nvidia',
    command: 'nvidia-smi -pm 1',
    revertCommand: 'nvidia-smi -pm 0',
    tags: ['NVIDIA', 'Latência'],
    profiles: ['competitive', 'casual'],
  },
  {
    id: 'gpu-nvidia-nvcache',
    title: 'Limpar Cache de Shaders (NVIDIA)',
    description:
      'Remove o cache de shaders compilados pela NVIDIA (pasta NV_Cache). Shaders corrompidos ou desatualizados podem causar engasgos em jogos — limpar o cache força a GPU a recompilá-los de forma limpa. O cache é recriado automaticamente. Exige GPU NVIDIA.',
    category: 'gpu',
    risk: 'low',
    impact: 'medium',
    requiresRestart: false,
    requiresAdmin: true,
    vendor: 'nvidia',
    command:
      'Remove-Item "$env:ProgramData\\NVIDIA Corporation\\NV_Cache\\*" -Recurse -Force -ErrorAction SilentlyContinue; Write-Output "Cache de shaders NVIDIA limpo"',
    revertCommand: '',
    tags: ['NVIDIA', 'Cache'],
    profiles: ['casual'],
  },
  {
    id: 'gpu-amd-ulps',
    title: 'Desativar Estado de Baixa Potência (ULPS) da GPU AMD',
    description:
      'Desativa o Ultra Low Power State (ULPS) do driver AMD/Radeon. O ULPS reduz o clock da GPU quando ociosa, mas pode causar instabilidade em sistemas com múltiplas GPUs e aumentar micro-stutter em alguns jogos. Desativá-lo mantém a GPU pronta para desempenho máximo. Exige GPU AMD/Radeon.',
    category: 'gpu',
    risk: 'medium',
    impact: 'medium',
    requiresRestart: true,
    requiresAdmin: true,
    vendor: 'amd',
    command: [
      '$base = "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}"',
      'Get-ChildItem $base -ErrorAction SilentlyContinue | ForEach-Object {',
      '  $props = Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue',
      '  if ($props.DriverDesc -match "Radeon|AMD" -and $_.PSChildName -match "^\\d+$") {',
      '    Set-ItemProperty -Path $_.PSPath -Name "EnableUlps" -Value 0 -Type DWord -Force',
      '  }',
      '}',
    ].join('\n'),
    revertCommand: [
      '$base = "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}"',
      'Get-ChildItem $base -ErrorAction SilentlyContinue | ForEach-Object {',
      '  $props = Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue',
      '  if ($props.DriverDesc -match "Radeon|AMD" -and $_.PSChildName -match "^\\d+$") {',
      '    Set-ItemProperty -Path $_.PSPath -Name "EnableUlps" -Value 1 -Type DWord -Force',
      '  }',
      '}',
    ].join('\n'),
    tags: ['AMD', 'Estabilidade'],
    profiles: ['competitive', 'casual'],
  },
  {
    id: 'gpu-amd-shader-cache',
    title: 'Ativar Cache de Shaders (AMD)',
    description:
      'Habilita o cache de shaders do driver AMD/Radeon (ShaderCache = 1). O cache guarda shaders já compilados em disco, evitando recompilação a cada execução do jogo e reduzindo engasgos. Exige GPU AMD/Radeon.',
    category: 'gpu',
    risk: 'low',
    impact: 'medium',
    requiresRestart: true,
    requiresAdmin: true,
    vendor: 'amd',
    command: [
      '$base = "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}"',
      'Get-ChildItem $base -ErrorAction SilentlyContinue | ForEach-Object {',
      '  $props = Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue',
      '  if ($props.DriverDesc -match "Radeon|AMD" -and $_.PSChildName -match "^\\d+$") {',
      '    Set-ItemProperty -Path $_.PSPath -Name "ShaderCache" -Value 1 -Type DWord -Force',
      '  }',
      '}',
    ].join('\n'),
    revertCommand: [
      '$base = "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}"',
      'Get-ChildItem $base -ErrorAction SilentlyContinue | ForEach-Object {',
      '  $props = Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue',
      '  if ($props.DriverDesc -match "Radeon|AMD" -and $_.PSChildName -match "^\\d+$") {',
      '    Set-ItemProperty -Path $_.PSPath -Name "ShaderCache" -Value 0 -Type DWord -Force',
      '  }',
      '}',
    ].join('\n'),
    tags: ['AMD', 'Shaders'],
    profiles: ['casual', 'streaming'],
  },

  // ═══════════════════════ ENERGIA ═══════════════════════
  {
    id: 'pow-high-performance',
    title: 'Ativar Plano de Alto Desempenho',
    description:
      'Ativa o plano de energia "Alto Desempenho" do Windows. Ele impede que o sistema reduza o clock da CPU e da GPU para economizar energia, garantindo performance máxima consistente durante os jogos.',
    category: 'power',
    risk: 'low',
    impact: 'high',
    requiresRestart: false,
    requiresAdmin: true,
    command: 'powercfg /setactive SCHEME_MIN',
    revertCommand: 'powercfg /setactive SCHEME_BALANCED',
    tags: ['CPU', 'Performance'],
    profiles: ['competitive', 'casual', 'streaming'],
  },
  {
    id: 'pow-ultimate-performance',
    title: 'Ativar Plano Ultimate Performance',
    description:
      'Ativa o plano de energia oculto "Ultimate Performance", criado pela Microsoft para servidores/workstations. Ele remove micro-suspensões de componentes (Core Parking, Power Throttling) para máxima performance. Só funciona em Windows 10/11 Pro ou Enterprise.',
    category: 'power',
    risk: 'medium',
    impact: 'high',
    requiresRestart: false,
    requiresAdmin: true,
    command:
      'powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61 | Out-Null; $guid = (powercfg -l | Select-String "Ultimate Performance").ToString() -replace ".*?([0-9a-fA-F-]{36}).*", "$1"; if ($guid -match "^[0-9a-fA-F-]{36}$") { powercfg /setactive $guid } else { powercfg /setactive SCHEME_MIN }',
    revertCommand: 'powercfg /setactive SCHEME_BALANCED',
    tags: ['CPU', 'Performance'],
    profiles: ['competitive'],
  },
  {
    id: 'pow-cpu-states',
    title: 'CPU Sempre em 100% (Min/Max State)',
    description:
      'Força o estado mínimo e máximo da CPU para 100%. O Windows não reduzirá mais o clock do processador em momentos de baixa demanda, eliminando micro-stutters e garantindo FPS mais estável em jogos.',
    category: 'power',
    risk: 'low',
    impact: 'high',
    requiresRestart: false,
    requiresAdmin: true,
    command:
      'powercfg /setacvalueindex SCHEME_CURRENT SUB_PROCESSOR PROCTHROTTLEMIN 100; powercfg /setacvalueindex SCHEME_CURRENT SUB_PROCESSOR PROCTHROTTLEMAX 100; powercfg /setactive SCHEME_CURRENT',
    revertCommand:
      'powercfg /setacvalueindex SCHEME_CURRENT SUB_PROCESSOR PROCTHROTTLEMIN 5; powercfg /setacvalueindex SCHEME_CURRENT SUB_PROCESSOR PROCTHROTTLEMAX 100; powercfg /setactive SCHEME_CURRENT',
    tags: ['CPU', 'FPS'],
    profiles: ['competitive', 'casual', 'streaming'],
  },
  {
    id: 'pow-cpu-parking',
    title: 'Desativar Core Parking da CPU',
    description:
      'Desativa o "estacionamento" de núcleos da CPU, que coloca núcleos inativos em estado de economia. Alguns jogos são mal agendados e sofrem stutter quando núcleos são desligados/reiniciados. Desativar mantém todos os núcleos sempre prontos.',
    category: 'power',
    risk: 'low',
    impact: 'medium',
    requiresRestart: false,
    requiresAdmin: true,
    command:
      'powercfg /setacvalueindex SCHEME_CURRENT SUB_PROCESSOR CPMINCORES 0; powercfg /setactive SCHEME_CURRENT',
    revertCommand:
      'powercfg /setacvalueindex SCHEME_CURRENT SUB_PROCESSOR CPMINCORES 100; powercfg /setactive SCHEME_CURRENT',
    tags: ['CPU', 'Stutter'],
    profiles: ['competitive', 'streaming'],
  },
  {
    id: 'pow-usb-suspend',
    title: 'Desativar Suspensão Seletiva de USB',
    description:
      'Desativa a economia de energia das portas USB. Teclados, mouses e headsets podem sofrer micro-atrasos quando o Windows suspende as portas. Desativar garante resposta instantânea dos periféricos, importante em jogos competitivos.',
    category: 'power',
    risk: 'low',
    impact: 'medium',
    requiresRestart: false,
    requiresAdmin: true,
    command:
      'powercfg /setacvalueindex SCHEME_CURRENT 2a737441-1930-4402-8d77-b2bebba308a3 48e6b7a6-50f5-4782-a5d4-53bb8f07e226 0; powercfg /setactive SCHEME_CURRENT',
    revertCommand:
      'powercfg /setacvalueindex SCHEME_CURRENT 2a737441-1930-4402-8d77-b2bebba308a3 48e6b7a6-50f5-4782-a5d4-53bb8f07e226 1; powercfg /setactive SCHEME_CURRENT',
    tags: ['Periféricos', 'Latência'],
    profiles: ['competitive', 'casual'],
  },
  {
    id: 'pow-sleep-off',
    title: 'Desativar Suspensão e Hibernação',
    description:
      'Impede que o PC entre em suspensão, hibernação ou desligue o disco durante o uso. Isso evita que o sistema "acorde" no meio de uma partida, causando engasgos ou desconexões.',
    category: 'power',
    risk: 'low',
    impact: 'medium',
    requiresRestart: false,
    requiresAdmin: true,
    command:
      'powercfg /change standby-timeout-ac 0; powercfg /change hibernate-timeout-ac 0; powercfg /change disk-timeout-ac 0',
    revertCommand:
      'powercfg /change standby-timeout-ac 30; powercfg /change disk-timeout-ac 20',
    tags: ['Estabilidade'],
    profiles: ['competitive', 'casual', 'streaming'],
  },
  {
    id: 'pow-hibernate-off',
    title: 'Desativar Arquivo de Hibernação',
    description:
      'Remove o arquivo hiberfil.sys do disco, que pode ocupar vários GB (normalmente 40-75% da sua RAM). Além de liberar espaço, evita gravações de hibernação que usam disco e energia. O PC continua podendo usar suspensão.',
    category: 'power',
    risk: 'low',
    impact: 'medium',
    requiresRestart: true,
    requiresAdmin: true,
    command: 'powercfg /hibernate off',
    revertCommand: 'powercfg /hibernate on',
    tags: ['Disco', 'Espaço'],
    profiles: ['casual', 'streaming'],
  },

  // ═══════════════════════ DEBLOAT ═══════════════════════
  {
    id: 'deb-bloat-apps',
    title: 'Remover Apps Pré-instalados (Bloatware)',
    description:
      'Remove aplicativos desnecessários que vêm com o Windows (Notícias, Clima, Dicas, Office Hub, Filmes e TV, etc.). Esses apps consomem espaço, memória e ficam atualizando em segundo plano. A lista é segura e não remove apps essenciais.',
    category: 'debloat',
    risk: 'medium',
    impact: 'medium',
    requiresRestart: true,
    requiresAdmin: true,
    command:
      '$packages = "Microsoft.BingNews","Microsoft.BingWeather","Microsoft.GetHelp","Microsoft.Getstarted","Microsoft.Microsoft3DViewer","Microsoft.MicrosoftOfficeHub","Microsoft.MicrosoftSolitaireCollection","Microsoft.MicrosoftStickyNotes","Microsoft.MixedReality.Portal","Microsoft.Office.OneNote","Microsoft.OneConnect","Microsoft.People","Microsoft.PowerAutomateDesktop","Microsoft.SkypeApp","Microsoft.Todos","Microsoft.WindowsAlarms","Microsoft.WindowsCamera","Microsoft.WindowsFeedbackHub","Microsoft.WindowsMaps","Microsoft.WindowsSoundRecorder","Microsoft.YourPhone","Microsoft.ZuneMusic","Microsoft.ZuneVideo","Microsoft.549981C3F5F10","Clipchamp.Clipchamp"; foreach ($p in $packages) { Get-AppxPackage -Name $p -ErrorAction SilentlyContinue | Remove-AppxPackage -ErrorAction SilentlyContinue }; Write-Output "Apps de bloatware removidos"',
    revertCommand:
      'Start-Process "ms-windows-store://downloads"',
    tags: ['Apps', 'RAM', 'Espaço'],
    profiles: ['competitive', 'casual'],
  },
  {
    id: 'deb-xbox-apps',
    title: 'Remover Apps do Xbox (Overlay)',
    description:
      'Remove o Xbox Gaming Overlay e apps relacionados que rodam em segundo plano. O overlay do Xbox pode causar queda de FPS e inconsistência em alguns jogos. Se você não usa gravação do Xbox, pode remover. Reinstalável pela Microsoft Store.',
    category: 'debloat',
    risk: 'medium',
    impact: 'medium',
    requiresRestart: true,
    requiresAdmin: true,
    command:
      '$packages = "Microsoft.XboxGamingOverlay","Microsoft.XboxApp","Microsoft.XboxIdentityProvider","Microsoft.XboxSpeechToTextOverlay","Microsoft.Xbox.TCUI","Microsoft.GamingApp"; foreach ($p in $packages) { Get-AppxPackage -Name $p -ErrorAction SilentlyContinue | Remove-AppxPackage -ErrorAction SilentlyContinue }; Write-Output "Apps do Xbox removidos"',
    revertCommand:
      'Start-Process "ms-windows-store://pdp/?productid=9NZKPSTSNW4P"',
    tags: ['Overlay', 'FPS'],
    profiles: ['competitive', 'streaming'],
  },
  {
    id: 'deb-onedrive',
    title: 'Remover OneDrive',
    description:
      'Desinstala o OneDrive do seu PC. O OneDrive roda em segundo plano, sincronizando arquivos e consumindo CPU, memória e rede. Se você não usa sincronização na nuvem, remover libera recursos e evita conflitos de arquivos nos jogos.',
    category: 'debloat',
    risk: 'medium',
    impact: 'low',
    requiresRestart: false,
    requiresAdmin: false,
    command:
      'Get-Process OneDrive -ErrorAction SilentlyContinue | Stop-Process -Force; $exe = "$env:SystemRoot\\SysWOW64\\OneDriveSetup.exe"; if (Test-Path $exe) { Start-Process $exe -ArgumentList "/uninstall" -Wait -ErrorAction SilentlyContinue }; Write-Output "OneDrive desinstalado"',
    revertCommand: 'Start-Process "https://onedrive.live.com/about/pt-br/download/"',
    tags: ['Cloud', 'Rede'],
    profiles: ['casual'],
  },
  {
    id: 'deb-teams-app',
    title: 'Remover Microsoft Teams (Pessoal)',
    description:
      'Remove o Microsoft Teams para uso pessoal, que costuma iniciar com o Windows e ficar em segundo plano consumindo memória. Você pode reinstalá-lo pela Microsoft Store quando quiser.',
    category: 'debloat',
    risk: 'low',
    impact: 'low',
    requiresRestart: false,
    requiresAdmin: false,
    command:
      'Get-AppxPackage -Name "MicrosoftTeams" -ErrorAction SilentlyContinue | Remove-AppxPackage -ErrorAction SilentlyContinue; Write-Output "Teams removido"',
    revertCommand:
      'Start-Process "ms-windows-store://pdp/?productid=XP8BT8DW290MP"',
    tags: ['RAM', 'Apps'],
    profiles: ['casual'],
  },
  {
    id: 'deb-cortana',
    title: 'Remover Cortana',
    description:
      'Desativa e remove a Cortana, assistente de voz do Windows. Ela roda serviços de reconhecimento de voz em segundo plano. Se você não usa assistente de voz, remover libera recursos.',
    category: 'debloat',
    risk: 'medium',
    impact: 'low',
    requiresRestart: false,
    requiresAdmin: true,
    command:
      'Get-AppxPackage -Name "Microsoft.549981C3F5F10" -ErrorAction SilentlyContinue | Remove-AppxPackage -AllUsers -ErrorAction SilentlyContinue; reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\Windows Search" /v AllowCortana /t REG_DWORD /d 0 /f',
    revertCommand:
      'reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\Windows Search" /v AllowCortana /t REG_DWORD /d 1 /f',
    tags: ['Assistente', 'RAM'],
    profiles: ['casual'],
  },

  // ═══════════════════════ SERVIÇOS ═══════════════════════
  {
    id: 'svc-sysmain',
    title: 'Desativar SysMain (Superfetch)',
    description:
      'Desativa o serviço SysMain/Superfetch, que pré-carrega programas na memória prevendo seu uso. Em SSDs modernos isso é desnecessário e pode causar alto uso de disco e memória. Desativar libera RAM e reduz atividade do disco em segundo plano.',
    category: 'services',
    risk: 'medium',
    impact: 'high',
    requiresRestart: true,
    requiresAdmin: true,
    command:
      'sc config SysMain start= disabled; net stop SysMain 2>$null; Write-Output "SysMain desativado"',
    revertCommand:
      'sc config SysMain start= auto; net start SysMain 2>$null; Write-Output "SysMain ativado"',
    tags: ['RAM', 'Disco'],
    profiles: ['competitive', 'casual', 'streaming'],
  },
  {
    id: 'svc-search',
    title: 'Desativar Pesquisa do Windows (Indexação)',
    description:
      'Desativa o serviço de pesquisa do Windows e a indexação de arquivos. A indexação fica constantemente varrendo o disco em segundo plano. Desativar reduz uso de CPU e disco. Você ainda pode pesquisar, só não terá resultados instantâneos.',
    category: 'services',
    risk: 'medium',
    impact: 'medium',
    requiresRestart: true,
    requiresAdmin: true,
    command:
      'sc config WSearch start= disabled; net stop WSearch 2>$null; Write-Output "Indexação desativada"',
    revertCommand:
      'sc config WSearch start= auto; net start WSearch 2>$null; Write-Output "Indexação ativada"',
    tags: ['CPU', 'Disco'],
    profiles: ['competitive', 'casual'],
  },
  {
    id: 'svc-diagtrack',
    title: 'Desativar Telemetria (DiagTrack)',
    description:
      'Desativa o serviço de rastreamento de diagnóstico (Connected User Experiences and Telemetry). Ele coleta e envia dados de uso do sistema constantemente, usando CPU e rede. Também melhora a privacidade.',
    category: 'services',
    risk: 'low',
    impact: 'medium',
    requiresRestart: true,
    requiresAdmin: true,
    command:
      'sc config DiagTrack start= disabled; net stop DiagTrack 2>$null; Write-Output "Telemetria desativada"',
    revertCommand:
      'sc config DiagTrack start= auto; net start DiagTrack 2>$null; Write-Output "Telemetria ativada"',
    tags: ['Privacidade', 'CPU'],
    profiles: ['competitive', 'casual', 'streaming'],
  },
  {
    id: 'svc-dmwappush',
    title: 'Desativar DM WAP Push',
    description:
      'Desativa o serviço de push de mensagens WAP (usado por alguns apps do sistema). É um serviço desnecessário para a maioria dos usuários e roda em segundo plano consumindo recursos.',
    category: 'services',
    risk: 'low',
    impact: 'low',
    requiresRestart: false,
    requiresAdmin: true,
    command:
      'sc config dmwappushservice start= disabled; Write-Output "DM WAP Push desativado"',
    revertCommand:
      'sc config dmwappushservice start= auto; Write-Output "DM WAP Push ativado"',
    tags: ['Rede'],
    profiles: ['casual', 'streaming'],
  },
  {
    id: 'svc-print-spooler',
    title: 'Desativar Spooler de Impressão',
    description:
      'Desativa o serviço de fila de impressão. Se você não tem impressora, esse serviço é desnecessário e fica rodando em segundo plano. Reative se precisar imprimir no futuro.',
    category: 'services',
    risk: 'medium',
    impact: 'low',
    requiresRestart: true,
    requiresAdmin: true,
    command:
      'sc config Spooler start= disabled; net stop Spooler 2>$null; Write-Output "Spooler desativado"',
    revertCommand:
      'sc config Spooler start= auto; net start Spooler 2>$null; Write-Output "Spooler ativado"',
    tags: ['Impressora', 'RAM'],
    profiles: ['casual'],
  },
  {
    id: 'svc-sensors',
    title: 'Desativar Serviço de Sensores',
    description:
      'Desativa o serviço de monitoramento de sensores do sistema (luz ambiente, presença, etc.). A maioria dos PCs não usa esses sensores em jogos, e o serviço consome recursos desnecessariamente.',
    category: 'services',
    risk: 'low',
    impact: 'low',
    requiresRestart: false,
    requiresAdmin: true,
    command:
      'sc config SensrSvc start= disabled; Write-Output "Serviço de sensores desativado"',
    revertCommand:
      'sc config SensrSvc start= demand; Write-Output "Serviço de sensores reativado"',
    tags: ['RAM'],
    profiles: ['casual'],
  },

  // ═══════════════════════ ARMAZENAMENTO ═══════════════════════
  {
    id: 'sto-last-access',
    title: 'Desativar Atualização de Último Acesso (NTFS)',
    description:
      'Impede que o NTFS atualize o carimbo de "último acesso" de arquivos e pastas. Cada leitura de arquivo gerava uma gravação no disco. Desativar reduz o trabalho do disco e melhora a velocidade de leitura, principalmente em SSDs.',
    category: 'storage',
    risk: 'low',
    impact: 'medium',
    requiresRestart: true,
    requiresAdmin: true,
    command: 'fsutil behavior set disablelastaccess 1',
    revertCommand: 'fsutil behavior set disablelastaccess 2',
    tags: ['SSD', 'NTFS'],
    profiles: ['competitive', 'casual', 'streaming'],
  },
  {
    id: 'sto-prefetch',
    title: 'Desativar Prefetch (SSD)',
    description:
      'Desativa o Prefetch e Superfetch do registro. Em SSDs a leitura é tão rápida que o Prefetch não traz benefício e ainda gera gravações extras no disco. Recomendado apenas para quem usa SSD como disco do sistema.',
    category: 'storage',
    risk: 'medium',
    impact: 'medium',
    requiresRestart: true,
    requiresAdmin: true,
    command:
      'reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Memory Management\\PrefetchParameters" /v EnablePrefetcher /t REG_DWORD /d 0 /f; reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Memory Management\\PrefetchParameters" /v EnableSuperfetch /t REG_DWORD /d 0 /f',
    revertCommand:
      'reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Memory Management\\PrefetchParameters" /v EnablePrefetcher /t REG_DWORD /d 3 /f; reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Memory Management\\PrefetchParameters" /v EnableSuperfetch /t REG_DWORD /d 3 /f',
    tags: ['SSD', 'Boot'],
    profiles: ['competitive'],
  },
{
    id: 'sto-sched-defrag',
    title: 'Desativar Desfragmentação Agendada (SSD)',
    description:
      'Desativa o agendamento automático do Desfragmentador do Windows para evitar desgaste desnecessário do SSD. Em SSDs modernos não é necessário desfragmentar, pois reduz a vida útil das células de memória sem ganho perceptível.',
    category: 'storage',
    risk: 'low',
    impact: 'low',
    requiresRestart: false,
    requiresAdmin: true,
    command: 'schtasks /Change /TN "\\Microsoft\\Windows\\Defrag\\ScheduledDefrag" /Disable',
    revertCommand: 'schtasks /Change /TN "\\Microsoft\\Windows\\Defrag\\ScheduledDefrag" /Enable',
    tags: ['SSD', 'Desgaste'],
    profiles: ['competitive', 'casual'],
  },

  // ═══════════════════════ PRIVACIDADE ═══════════════════════
  {
    id: 'priv-telemetry',
    title: 'Desativar Telemetria do Windows',
    description:
      'Desativa a coleta de dados de diagnóstico e uso do Windows via Política. Isso reduz o tráfego de rede em segundo plano e aumenta sua privacidade. Os dados deixam de ser enviados à Microsoft.',
    category: 'privacy',
    risk: 'low',
    impact: 'medium',
    requiresRestart: true,
    requiresAdmin: true,
    command:
      'reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection" /v AllowTelemetry /t REG_DWORD /d 0 /f',
    revertCommand:
      'reg delete "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection" /v AllowTelemetry /f',
    tags: ['Privacidade', 'Rede'],
    profiles: ['competitive', 'casual', 'streaming'],
  },
  {
    id: 'priv-advertising-id',
    title: 'Desativar ID de Publicidade',
    description:
      'Desativa o ID de publicidade que o Windows gera para apps de terceiros. Isso impede o rastreamento entre apps para personalizar anúncios e melhora sua privacidade.',
    category: 'privacy',
    risk: 'low',
    impact: 'low',
    requiresRestart: false,
    requiresAdmin: false,
    command:
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\AdvertisingInfo" /v Enabled /t REG_DWORD /d 0 /f',
    revertCommand:
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\AdvertisingInfo" /v Enabled /t REG_DWORD /d 1 /f',
    tags: ['Privacidade'],
    profiles: ['casual', 'streaming'],
  },
  {
    id: 'priv-tailored-experiences',
    title: 'Desativar Experiências Personalizadas',
    description:
      'Desativa as "experiências personalizadas" que usam seus dados de diagnóstico para sugerir conteúdo (ex: dicas na tela de bloqueio). Reduz coleta de dados e anúncios dentro do sistema.',
    category: 'privacy',
    risk: 'low',
    impact: 'low',
    requiresRestart: false,
    requiresAdmin: false,
    command:
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Privacy" /v TailoredExperiencesWithDiagnosticDataEnabled /t REG_DWORD /d 0 /f',
    revertCommand:
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Privacy" /v TailoredExperiencesWithDiagnosticDataEnabled /t REG_DWORD /d 1 /f',
    tags: ['Privacidade'],
    profiles: ['casual'],
  },
  {
    id: 'priv-activity-history',
    title: 'Desativar Histórico de Atividades',
    description:
      'Desativa o histórico de atividades, que registra tudo o que você faz no PC (apps usados, arquivos abertos) e pode sincronizar com a nuvem. Desativar melhora privacidade e reduz escrita em disco.',
    category: 'privacy',
    risk: 'low',
    impact: 'low',
    requiresRestart: false,
    requiresAdmin: false,
    command:
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Privacy" /v ActivityHistoryEnabled /t REG_DWORD /d 0 /f',
    revertCommand:
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Privacy" /v ActivityHistoryEnabled /t REG_DWORD /d 1 /f',
    tags: ['Privacidade'],
    profiles: ['casual', 'streaming'],
  },
  {
    id: 'priv-location',
    title: 'Desativar Serviço de Localização',
    description:
      'Desativa o acesso de aplicativos ao seu local. Isso impede que apps e serviços rastreiem sua localização e reduz comunicação com servidores de localização da Microsoft.',
    category: 'privacy',
    risk: 'low',
    impact: 'low',
    requiresRestart: false,
    requiresAdmin: false,
    command:
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\CapabilityAccessManager\\ConsentStore\\location" /v Value /t REG_SZ /d "Deny" /f',
    revertCommand:
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\CapabilityAccessManager\\ConsentStore\\location" /v Value /t REG_SZ /d "Allow" /f',
    tags: ['Privacidade'],
    profiles: ['casual'],
  },
]

export function getCategory(category: OptimizationCategory): CategoryInfo {
  return categories.find((c) => c.id === category)!
}

export function getOptimizationsByCategory(category: OptimizationCategory | 'all'): OptimizationItem[] {
  if (category === 'all') return optimizations
  return optimizations.filter((o) => o.category === category)
}