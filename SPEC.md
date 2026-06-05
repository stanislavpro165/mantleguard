# MantleGuard — AI Security Agent для Mantle

> **Трек:** AI DevTools (Tencent Cloud)
> **Хакатон:** The Turing Test Hackathon 2026 — Mantle Phase II
> **Дедлайн:** 15 июня 2026
> **Команда:** Бакуган + Деби (AI-оператор)
> **Миссия:** Урвать $8.5K (трек) + $1K (деплой) + замах на $9K (гранд-чемпион)

---

## 1. КОНЦЕПЦИЯ

**MantleGuard** — AI-агент для аудита безопасности и оптимизации газа смарт-контрактов на Mantle.

В отличие от тупых обёрток ChatGPT:
- Используем **реальный статический анализ Solidity AST**
- Детектим **10+ классов уязвимостей** по SWC-категориям
- Оптимизируем **gas под Mantle L2** (calldata vs memory, batch call, специфика)
- Даём **конкретные фиксы**, а не «ну там надо подумать»
- Работает как **Web UI** (для разрабов) и **CLI** (для CI/CD)

---

## 2. ПОЧЕМУ МЫ ВЫИГРЫВАЕМ

| Фактор | Вайбкодер | Мы |
|--------|-----------|-----|
| **Глубина анализа** | GPT-обёртка | AST-парсер + паттерн-матчинг + AI |
| **Экспертиза** | Общая | 100+ security-скиллов, reverse engineering, Solidity |
| **Mantle-специфика** | Нет | Прямые оптимизации под L2 |
| **UX** | Сырой | Красивый UI + CLI |
| **Демка** | скидывают ссылку | HyperFrames видео + живой деплой |

---

## 3. АРХИТЕКТУРА

```
┌────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                    │
│  Monaco Editor ← контракт → Report Dashboard ↓          │
├────────────────────────────────────────────────────────┤
│              BACKEND API (Python FastAPI)                │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Solidity     │  │ Vulnerability│  │ AI-Analyzer  │  │
│  │ Parser (AST) │→│ Detector     │→│ (LLM-фиксы)   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         ↓                ↓                 ↓           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Gas          │  │ Report       │  │ Fix          │  │
│  │ Optimizer    │  │ Generator    │  │ Suggester    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
├────────────────────────────────────────────────────────┤
│              CLI (Python Click)                          │
│  mantleguard audit contract.sol                         │
│  mantleguard analyze --json                             │
│  mantleguard fix contract.sol --output fixed.sol        │
├────────────────────────────────────────────────────────┤
│              ДЕПЛОЙ (Mantle Sepolia Testnet)             │
│  Демо-контракт с уязвимостями → аудит → фикс →          │
│  показываем транзакции                                  │
└────────────────────────────────────────────────────────┘
```

---

## 4. СТЕК

| Компонент | Технология |
|-----------|-----------|
| Frontend | Next.js 15 + Tailwind CSS v4 |
| Code Editor | Monaco Editor (@monaco-editor/react) |
| Backend | Python 3.12 + FastAPI |
| Solidity Parser | `solidity-parser-antlr` или `@solidity-parser/parser` (Python binding) |
| AI | OpenAI API / DeepSeek (через нашего провайдера Zen) |
| CLI | Python Click |
| Деплой | Mantle Sepolia (via Foundry или Hardhat) |
| Демо-видео | HyperFrames |
| Версионирование | GitHub |

---

## 5. ДЕТЕКЦИЯ УЯЗВИМОСТЕЙ (Core Engine)

Минимум 10 классов, детектимых **без AI** (чистый AST-анализ):

| # | Уязвимость | SWC-ID | Как детектим |
|---|-----------|--------|-------------|
| 1 | Reentrancy | SWC-107 | Анализ call/transfer после state change |
| 2 | Unchecked external call | SWC-104 | require/assert после .call() |
| 3 | Integer overflow/underflow | SWC-101 | Арифметика без SafeMath |
| 4 | Tx.origin auth | SWC-115 | Использование tx.origin в require |
| 5 | Timestamp dependence | SWC-116 | block.timestamp в сравнениях |
| 6 | Gas griefing | SWC-126 | Циклы с unbounded gas |
| 7 | Uninitialized storage pointer | SWC-109 | Struct reference без new |
| 8 | Delegatecall to untrusted | SWC-112 | delegatecall с переменной |
| 9 | Missing access control | SWC-105 | onlyOwner/functions без модификаторов |
| 10 | Selfdestruct | SWC-106 | Наличие selfdestruct |
| 11 | Shadowed variables | SWC-119 | Перекрытие имен |
| 12 | Unused return | SWC-104 | Возврат без проверки |

**Gas-оптимизации под Mantle:**
- Использование calldata вместо memory в read-only
- Pack structs для дешевого storage
- Short-circuit в require
- Меньше storage vs memory
- Использование `unchecked` где safe
- Неиспользуемые imports

---

## 6. UX

### Web UI:
1. **Paste / Upload** — кидаешь .sol файл или вставляешь код
2. **Мгновенный анализ** — AST-парсер за <1с показывает базовые ошибки
3. **Deep AI Scan** — LLM догоняет сложные паттерны за 5-15с
4. **Дашборд** — цветной отчёт: Critical / High / Medium / Gas
5. **Fix Mode** — нажал → получил фикс-версию контракта
6. **Deploy Check** — проверка готовности к деплою на Mantle

### CLI:
```bash
mantleguard audit Contract.sol                    # Полный отчёт
mantleguard audit Contract.sol --json             # JSON для CI
mantleguard fix Contract.sol --output Fixed.sol    # Авто-фикс
mantleguard gas Contract.sol                       # Только газ
mantleguard init                                    # Создать .sol с тестовыми уязвимостями
```

---

## 7. ГРАФИК (10 дней до дедлайна)

```
День 1 (5 июня)   — ТЗ, репо, настройка проекта, Solidity-парсер   ← МЫ ТУТ
День 2 (6 июня)   — Детектор уязвимостей (Core Engine)           
День 3 (7 июня)   — Детектор (продолжение) + Gas-оптимизатор    
День 4 (8 июня)   — FastAPI backend + эндпоинты                  
День 5 (9 июня)   — Frontend: Monaco + базовый UI               
День 6 (10 июня)  — Frontend: дашборд + отчёт                   
День 7 (11 июня)  — CLI-инструмент                              
День 8 (12 июня)  — Деплой демо-контракта на Mantle + интеграция 
День 9 (13 июня)  — HyperFrames демо-видео + полировка           
День 10 (14 июня) — Финальный сабмит, питч-дек, аплоад          
День 11 (15 июня) — Буфер (дедлайн)
```

---

## 8. ЧТО ДЕПЛОИМ (для $1K)

Для выполнения условия «20 финалистов задеплоили на Mantle» нам нужно:
1. Создать контракт с типовыми уязвимостями (набор)
2. Задеплоить на Mantle Sepolia
3. Провести аудит через MantleGuard
4. Показать транзакции аудита и фикса

Этого достаточно для **$1K**.

---

## 9. ДЕМО-ВИДЕО (HyperFrames)

То, что выделит нас среди 200 других сабмитов:
- Короткий ролик (60-90 сек)
- Сцена: «Разработчик грузит контракт → MantleGuard находит reentrancy → фиксит за 1 клик → показывает saved gas на Mantle»
- Музыка, подсветка, драма

---

## 10. ПИТЧ-ДЕК (Demo Day)

Для гранд-при:
1. **Проблема:** $2B+ потеряно на взломах, разработчики не аудируют контракты
2. **Решение:** AI-агент, который делает аудит за секунды, а не недели
3. **Уникальность:** Не тупая LLM-обёртка, а реальный AST-парсер + AI
4. **Рынок:** Каждый Solidity-разработчик нуждается в быстром аудите
5. **Тракшн:** Задеплоено на Mantle, открытый исходный код

---

## 11. СТРУКТУРА РЕПО

```
mantleguard/
├── frontend/          # Next.js приложение
│   ├── app/
│   │   ├── page.tsx           # Главная (редактор)
│   │   ├── report/
│   │   │   └── page.tsx       # Дашборд
│   │   └── api/               # Прокси к бэку
│   ├── components/
│   └── package.json
├── backend/           # FastAPI сервер
│   ├── main.py
│   ├── analyzer/
│   │   ├── parser.py          # Solidity AST парсер
│   │   ├── detectors/         # Каждый детектор отдельно
│   │   │   ├── reentrancy.py
│   │   │   ├── access_control.py
│   │   │   └── ...
│   │   ├── gas_optimizer.py
│   │   └── ai_analyzer.py     # LLM-дообучение
│   ├── models/
│   ├── requirements.txt
│   └── Dockerfile
├── cli/               # Python CLI
│   ├── main.py
│   └── setup.py
├── contracts/         # Демо-контракты (уязвимые + фиксы)
├── SPEC.md            # Этот документ
└── README.md
```

---

## 12. КРИТЕРИИ УСПЕХА

- [x] **10+ классов уязвимостей** детектятся без AI
- [x] **Gas-отчёт** с конкретными оптимизациями под Mantle
- [x] **Красивый Web UI** с редактором и отчётом
- [x] **CLI-инструмент** с JSON-выходом
- [x] **Демо-контракт** задеплоен на Mantle Sepolia
- [x] **HyperFrames видео** (60-90 сек)
- [x] **Питч-дек** для Demo Day

---

## 🚀 СТАРТ

Начинаем с:
1. Инициализации репо
2. Solidity-парсера (основа всего)
3. Первых 3 детекторов (reentrancy, access control, unchecked call)

**ДЕБИ РАБОТАЕТ. БАКУГАН НАПРАВЛЯЕТ.**

Всё, брат.
