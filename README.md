<p align="center">
  <img src="https://img.shields.io/badge/Mantle%20Network-00D4AA?style=for-the-badge&logo=ethereum&logoColor=white"/>
  <img src="https://img.shields.io/badge/AI%20Security%20Agent-8A2BE2?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/The%20Turing%20Test%20Hackathon%202026-FF6B35?style=for-the-badge"/>
</p>

<h1 align="center">🛡️ MantleGuard</h1>
<h3 align="center">AI Security Agent for Solidity Smart Contracts</h3>
<h4 align="center">Track: AI DevTools (sponsored by Tencent Cloud)</h4>

<p align="center">
  <b>11 vulnerability detectors · Gas optimizer for Mantle L2 · AI-powered deep analysis · Web UI + CLI</b>
</p>

---

## 📸 Preview

```
┌─────────────────────────────────────────────────────────────┐
│  🛡️  MantleGuard — AI SECURITY AGENT                        │
│  ─────────────────────────────────────────────────────────── │
│                                                              │
│  ┌──────────────────────┐  ┌──────────────────────────────┐  │
│  │  Monaco Code Editor  │  │  🔴 Risk Score: 100/100     │  │
│  │                      │  │                              │  │
│  │  contract Vulnerable │  │  🔴 High:   9 findings      │  │
│  │  Wallet {            │  │  🟡 Medium: 1 finding       │  │
│  │    function withdraw │  │  ⛽ Gas:    4 optimizations  │  │
│  │    { ...             │  │                              │  │
│  │  }                   │  │  ─── Vulnerabilities ───     │  │
│  │                      │  │  Reentrancy (SWC-107)        │  │
│  │                      │  │  Missing Access Control      │  │
│  │                      │  │  Unchecked External Call     │  │
│  └──────────────────────┘  │  Selfdestruct               │  │
│                             │  Tx.origin Auth            │  │
│    [▶ Run Audit]           │  Timestamp Dependence      │  │
│                             └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏆 Prize Pool — Phase II (AI Awakening)

| Category | Amount | Status |
|----------|--------|--------|
| 🥇 **Grand Champion** | **$9,000** | Target |
| 🥇 **Track Prize (AI DevTools)** | **$8,500** | **Our track** |
| 👥 Community Voting (2×) | $8,500 | Stretch |
| 🎨 Best UI/UX | $3,000 | Possible |
| ✅ Finalist + Deployment (20×) | $1,000 each | Easy |
| 💻 API Computing Credits | $110,000 | Available |
| **Total Value** | **$223K+** | |

---

## 🎯 The Problem

In 2025, **over $2B** was lost in smart contract exploits. Most developers skip audits because:
- Professional audits cost **$50K–$200K** and take weeks
- Automated tools produce **false positives** or miss critical bugs
- AI wrappers around ChatGPT **don't understand Solidity semantics**

## 💡 The Solution

MantleGuard combines **static analysis** (AST-based) with **AI-powered reasoning** to deliver production-grade security audits in seconds — not weeks.

---

## 🔬 Core Engine: 11 Vulnerability Detectors

| # | Detector | SWC-ID | Detection Method | Accuracy |
|---|----------|--------|-----------------|----------|
| 1 | 🔴 **Reentrancy** | SWC-107 | Call pattern + state change analysis | High |
| 2 | 🔴 **Missing Access Control** | SWC-105 | Visibility & modifier inspection | High |
| 3 | 🟡 **Unchecked External Call** | SWC-104 | Return value verification | High |
| 4 | 🟡 **Integer Overflow** | SWC-101 | Arithmetic operation analysis | Medium |
| 5 | 🟡 **Tx.origin Auth** | SWC-115 | Authentication source detection | High |
| 6 | 🔵 **Timestamp Dependence** | SWC-116 | block.timestamp comparison | Medium |
| 7 | 🟡 **Gas Griefing** | SWC-126 | Loop bound analysis | High |
| 8 | 🔴 **Unsafe Delegatecall** | SWC-112 | Target address verification | High |
| 9 | 🔴 **Selfdestruct** | SWC-106 | Function presence detection | High |
| 10 | 🔵 **Shadowed Variables** | SWC-119 | Name conflict resolution | Medium |
| 11 | 🔵 **Unused Return** | SWC-104 | Return value tracking | Medium |
| | ⛽ **Gas Optimizations** | — | 7 Mantle L2 patterns | High |

---

## ⚡ Quick Start

### CLI — One-liner audit

```bash
# Clone and run
git clone https://github.com/stanislavpro165/mantleguard.git
cd mantleguard

# Full audit
python cli/main.py audit contracts/contracts/VulnerableWallet.sol

# JSON output for CI/CD pipelines
python cli/main.py audit contracts/contracts/VulnerableWallet.sol --json

# Gas analysis only
python cli/main.py gas contracts/contracts/VulnerableWallet.sol

# Generate demo contract
python cli/main.py init
```

### Web UI — Split-pane editor + report dashboard

```bash
# Terminal 1: Backend API
cd backend
pip install -r requirements.txt
python -X utf8 -m uvicorn main:app --port 8000

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                       FRONTEND (Next.js 15)                    │
│  ┌──────────────────────┐    ┌──────────────────────────────┐  │
│  │   Monaco Editor      │    │   Report Dashboard           │  │
│  │   (Solidity syntax)  │◄──►│   ├─ Risk Score (gauge)     │  │
│  │   Paste .sol code    │    │   ├─ Vulnerability list     │  │
│  │   Load Demo contract │    │   ├─ Gas optimizations      │  │
│  └──────────────────────┘    │   └─ AI deep analysis       │  │
│                              └──────────────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│                      BACKEND (Python FastAPI)                   │
│                                                               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌─────────┐ │
│  │  Solidity  │  │  11 Vuln   │  │    Gas     │  │   AI    │ │
│  │  Parser    │→│ Detectors  │→│ Optimizer  │→│ Analyzer│ │
│  │  (AST)     │  │  (SWC)     │  │  (Mantle)  │  │  (LLM)  │ │
│  └────────────┘  └────────────┘  └────────────┘  └─────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              CLI Tool (mantleguard)                    │   │
│  │  audit · fix · gas · init · --json                    │   │
│  └────────────────────────────────────────────────────────┘   │
├────────────────────────────────────────────────────────────────┤
│                    DEPLOYMENT (Mantle Sepolia)                  │
│  ┌────────────────────┐    ┌────────────────────────────────┐  │
│  │  VulnerableWallet  │    │     FixedWallet               │  │
│  │  (8 vulns, demo)   │    │     (all fixed, production)   │  │
│  └────────────────────┘    └────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

---

## 📊 Demo Output

```bash
$ python cli/main.py audit contracts/contracts/VulnerableWallet.sol

+================================================+
|  MantleGuard -- Security Audit                    |
|  Contract: VulnerableWallet                    |
+================================================+

  Risk Score: [HIGH] 100/100
  Detectors : 11
  Issues    : 14

  Severity:
    HIGH       9
    MEDIUM     1

  ─── Vulnerabilities (10) ───

  1. [HIGH] Missing Access Control: withdraw()
     Line 29 · SWC-105
     Public function without access modifier.

  2. [HIGH] Missing Access Control: stealETH()
     Line 40 · SWC-105
     Anyone can drain the contract.

  3. [HIGH] Reentrancy in withdraw()
     Line 29 · SWC-107
     External call before state change.

  ... and 7 more findings ...

  ─── Gas Optimizations (4) ───

  1. ⛽ Require without error message
     Line 69 · Save: ~0 gas (quality)

  2. ⛽ Use calldata instead of memory
     Save: ~100 gas per call on Mantle L2
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React 19, Tailwind CSS 4 |
| **Code Editor** | Monaco Editor (@monaco-editor/react) |
| **Backend** | Python 3.12, FastAPI |
| **Solidity Parser** | Custom AST parser (regex + solc) |
| **Detection Engine** | 11 static analysis modules |
| **AI Analysis** | OpenAI / DeepSeek API (optional) |
| **CLI** | Python, modular command structure |
| **Smart Contracts** | Solidity 0.7.6, Hardhat |
| **Target Network** | Mantle Sepolia (Chain ID 5003) |

---

## 📁 Project Structure

```
mantleguard/
├── backend/
│   ├── main.py              # FastAPI server (2 endpoints)
│   ├── analyzer/
│   │   ├── parser.py        # Solidity AST parser
│   │   ├── detectors/       # 11 vulnerability detectors
│   │   ├── gas_optimizer.py # Mantle L2 gas analysis
│   │   ├── ai_analyzer.py   # LLM deep analysis
│   │   └── models/          # Data models
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js pages
│   │   ├── components/      # React components (RiskGauge, Cards, etc.)
│   │   └── lib/             # API client, types
│   └── package.json
├── cli/
│   └── main.py              # CLI tool (audit, fix, gas, init)
├── contracts/
│   └── contracts/
│       ├── VulnerableWallet.sol  # Demo contract (8 vulns)
│       └── FixedWallet.sol       # Secure version
├── SPEC.md                  # Full technical specification
└── README.md                # This file
```

---

## 🚀 Roadmap

- [x] Core analysis engine (11 detectors)
- [x] CLI tool with JSON output
- [x] Web UI with Monaco Editor
- [x] Gas optimization for Mantle L2
- [x] AI-powered deep analysis
- [ ] Demo video (HyperFrames, 90 sec)
- [ ] Mantle Sepolia deployment
- [ ] DoraHacks submission

---

## 👥 Team

| Role | Name |
|------|------|
| **Builder** | Bakugan |
| **AI Operator** | Debi (autonomous agent) |

---

<p align="center">
  <b>Built for The Turing Test Hackathon 2026 — Mantle Network</b><br>
  <sub>Track: AI DevTools · Prize Pool: $223K+</sub>
</p>
