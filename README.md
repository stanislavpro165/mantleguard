# MantleGuard 🛡️

**AI Security Agent for Solidity Smart Contracts on Mantle Network**

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python)
![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js)
![Solidity](https://img.shields.io/badge/Solidity-0.7.6-363636?logo=solidity)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🏆 The Turing Test Hackathon 2026 — Mantle

**Track:** AI DevTools (sponsored by Tencent Cloud)

---

## What is MantleGuard?

MantleGuard is an **AI-powered security agent** that analyzes Solidity smart contracts for vulnerabilities and gas optimizations. Unlike simple ChatGPT wrappers, it uses:

- **Static AST analysis** — 11 vulnerability detectors
- **Gas optimizer** — 7 Mantle L2-specific optimizations
- **AI deep scan** — optional LLM-enhanced analysis
- **Web UI** — Monaco editor + interactive report dashboard
- **CLI** — for CI/CD integration

## Detectors

| # | Vulnerability | SWC-ID | Method |
|---|--------------|--------|--------|
| 1 | Reentrancy | SWC-107 | Call pattern + state change |
| 2 | Missing Access Control | SWC-105 | Public function scan |
| 3 | Unchecked External Call | SWC-104 | Return value check |
| 4 | Integer Overflow | SWC-101 | Arithmetics analysis |
| 5 | Tx.origin Auth | SWC-115 | Source detection |
| 6 | Timestamp Dependence | SWC-116 | block.timestamp usage |
| 7 | Gas Griefing | SWC-126 | Loops analysis |
| 8 | Unsafe Delegatecall | SWC-112 | Target address scan |
| 9 | Selfdestruct | SWC-106 | Source detection |
| 10 | Shadowed Variables | SWC-119 | Name conflict scan |
| 11 | Unused Return | SWC-104 | Return check |
| ⛽ | Gas Optimizations | — | 7 Mantle L2 patterns |

## Quick Start

```bash
# CLI audit
python cli/main.py audit contracts/contracts/VulnerableWallet.sol

# JSON output for CI
python cli/main.py audit contracts/contracts/VulnerableWallet.sol --json

# Gas analysis
python cli/main.py gas contracts/contracts/VulnerableWallet.sol
```

```bash
# Web UI (two terminals)

# Terminal 1 — Backend
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --port 8000

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

## Architecture

```
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   Next.js UI     │◄──►│  FastAPI Backend │◄──►│  11 Detectors    │
│  Monaco Editor   │    │  /audit endpoint │    │  + Gas Optimizer │
│  Report Dashboard│    │  /health         │    │  + AI Analyzer   │
└──────────────────┘    └──────────────────┘    └──────────────────┘
                                │
                         ┌──────┴──────┐
                         │  CLI Tool   │
                         │  mantleguard│
                         └─────────────┘
```

## Tech Stack

| Component | Tech |
|-----------|------|
| Frontend | Next.js 15 + Tailwind CSS 4 |
| Code Editor | Monaco Editor |
| Backend | Python FastAPI |
| Analysis | Custom Solidity AST parser |
| AI | OpenAI / DeepSeek (optional) |
| CLI | Python Click |
| Deployment | Hardhat + Mantle Sepolia |

## Prize Pool

| Category | Amount |
|----------|--------|
| Grand Champion | $9K |
| Track Prize (AI DevTools) | $8.5K |
| Community Voting | 2×$8.5K |
| Best UI/UX | $3K |
| Finalist + Deployment | 20×$1K |
| API Credits | $110K |

---

**Built with ❤️ by Bakugan + Debi for The Turing Test Hackathon 2026.**
