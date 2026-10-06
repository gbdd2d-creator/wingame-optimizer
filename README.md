# ⚡ WinGame Optimizer

Otimizador completo do **Windows para Gamers**, com interface minimalista e moderna. Aplicativo desktop construído com **Electron + React + TypeScript + Tailwind CSS**.

## ✨ Funcionalidades

### 🗂️ Otimizações em abas (com explicação de cada função)
Todas as otimizações estão organizadas por categoria e **explicam o que fazem no seu computador**:

- **Sistema** — Game DVR, prioridade de jogos, aceleração do mouse, efeitos visuais
- **Rede** — TCP auto-tuning, DNS rápido, desativar Nagle, remover limite de rede
- **GPU** — Agendamento acelerado por hardware, TDR timeout, OpenGL + opções específicas para **NVIDIA** e **AMD** (detectadas automaticamente)
- **Energia** — Planos de alto desempenho, CPU em 100%, desativar core parking
- **Debloat** — Remover bloatware, Xbox overlay, OneDrive, Cortana
- **Serviços** — SysMain, indexação, telemetria, spooler de impressão
- **Armazenamento** — NTFS, prefetch, desfragmentação
- **Privacidade** — Telemetria, ID de publicidade, localização

Cada otimização mostra **nível de risco** e **impacto**, com botão de **reverter** para voltar ao padrão.

### 🧹 Limpeza do sistema
Página própria para **liberar espaço em disco** com um clique: analisa e remove arquivos temporários do usuário, do sistema e o cache de atualizações do Windows — seguro e sem tocar em arquivos pessoais.

### 🎯 Perfis prontos
- **Competitivo** — máximo FPS e menor latência
- **Casual** — equilíbrio entre performance e estabilidade
- **Streaming** — otimizado para jogar e transmitir

### 📊 Monitor de performance em tempo real
CPU, memória, GPU, disco, rede e gráfico histórico — com intervalo de atualização configurável.

### 🛡️ Ferramentas
- **Pontos de restauração** — crie backups do sistema antes de otimizar
- **Drivers** — veja versões instaladas e acesse a página oficial do fabricante

### 🎨 Design
- Interface minimalista e moderna em **modo escuro** (com tema claro disponível)
- Efeitos glass, gradientes sutis e animações suaves
- Totalmente em **português** e fácil de usar

## 📦 Para download (instaladores prontos)

Os instaladores gerados ficam na pasta **`release/`**:

| Arquivo | Uso |
|---|---|
| `WinGame Optimizer-Setup-1.0.0.exe` | Instalador clássico (recomendado) |
| `WinGame Optimizer-Portable-1.0.0.exe` | Versão portátil, sem instalação |

> **Nota:** o aplicativo não é assinado. O Windows pode mostrar o aviso "Windows protegeu seu computador" → clique em **Mais informações → Executar assim mesmo**.

## 💡 Como usar

1. Execute o instalador (ou a versão portátil)
2. Na primeira tela, crie um **ponto de restauração** na aba **Ferramentas**
3. Escolha um **perfil** ou navegue pelas **Otimizações** e aplique item por item
4. Reinicie o PC ao final para aplicar tudo completamente

## 🛠️ Desenvolvimento

### Pré-requisitos
- [Node.js](https://nodejs.org) 18+

### Comandos

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento (com hot reload)
npm run dev

# Build do frontend
npm run build

# Gerar instaladores (.exe)
npm run dist
```

### Estrutura

```
├── electron/          # Backend Electron (processo principal)
│   ├── main.js        # Janela + IPC
│   ├── preload.js     # Ponte segura (contextBridge)
│   └── lib/           # Otimizações, monitor, restauração, drivers
├── src/
│   ├── components/    # Componentes UI (Button, Card, Badge, layout...)
│   ├── pages/         # Painel, Otimizações, Perfis, Monitor, Limpeza, Ferramentas, Config
│   ├── data/          # Catálogo de otimizações (comandos PowerShell)
│   ├── store/         # Estado global (Zustand)
│   └── lib/           # Bridge IPC, utilitários
└── build/             # Ícones do app
```

## 🧠 Como funciona

O aplicativo usa o backend do **Electron** (Node.js) para executar comandos **PowerShell** do Windows que aplicam cada otimização — as mesmas técnicas usadas por ferramentas profissionais. Todo comando tem uma **reversão** que restaura o padrão do sistema.

---

Feito com ♥ para gamers. 🎮