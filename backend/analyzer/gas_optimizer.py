"""Gas-оптимизатор (Mantle L2 специфика)."""

import re
from typing import List
from .models.report import GasIssue


def analyze_gas(source: str) -> List[GasIssue]:
    """Анализирует контракт на gas-оптимизации."""
    issues = []
    lines = source.split('\n')

    for i, line in enumerate(lines, 1):
        stripped = line.strip()

        # 1. Storage вместо memory для read-only массивов/структур
        if re.search(r'(string|bytes|uint\[\]|address\[\])\s+(public\s+)?\w+\s*;', stripped):
            if 'memory' not in stripped and 'calldata' not in stripped:
                issues.append(GasIssue(
                    title="Consider using `memory` or `calldata` for read-only data",
                    description=(
                        "Storage операции дорогие. Если данные только для "
                        "чтения, используйте memory или calldata."
                    ),
                    line_start=i,
                    line_end=i,
                    code_snippet=stripped,
                    estimated_saving="~200 gas per read on L2",
                    recommendation=(
                        "Переместите данные в memory/calldata, "
                        "если они не меняются."
                    ),
                ))

        # 2. Циклы с storage access (SLOAD)
        if re.search(r'for\s*\(', stripped) and re.search(r'\[\s*\w+\s*\]', stripped):
            issues.append(GasIssue(
                title="Storage array access in loop — cache length",
                description=(
                    "Доступ к storage переменной на каждой итерации цикла. "
                    "Кешируйте длину/элементы в memory."
                ),
                line_start=i,
                line_end=i,
                code_snippet=stripped,
                estimated_saving="~800 gas per 10 iterations on L2",
                recommendation=(
                    "uint len = array.length; // cache in memory\n"
                    "for(uint i; i < len; i++) { ... }"
                ),
            ))

        # 3. Использование > 0 вместо != 0
        if ' > 0' in stripped and re.search(r'\w+\s*>\s*0', stripped):
            issues.append(GasIssue(
                title="Use != 0 instead of > 0",
                description=(
                    "Операция != 0 дешевле чем > 0 для uint на EVM."
                ),
                line_start=i,
                line_end=i,
                code_snippet=stripped,
                estimated_saving="~6 gas",
                recommendation="Замените `> 0` на `!= 0`.",
            ))

        # 4. Public arrays — создаёт геттер
        if re.search(r'(\w+\[\])\s+public\s+\w+', stripped):
            issues.append(GasIssue(
                title="Public array auto-generates getter — use private + getter",
                description=(
                    "Public array автоматически создаёт геттер, "
                    "который обходится дороже."
                ),
                line_start=i,
                line_end=i,
                code_snippet=stripped,
                estimated_saving="~2000 gas on deploy",
                recommendation=(
                    "Если геттер не нужен — используйте private. "
                    "Если нужен — напишите свой."
                ),
            ))

        # 5. Require без сообщения
        if re.search(r'require\s*\(\s*[^,]+\)\s*;', stripped):
            issues.append(GasIssue(
                title="Require without error message",
                description=(
                    "Добавьте сообщение/причину в require. "
                    "Это улучшает UX и почти не влияет на газ."
                ),
                line_start=i,
                line_end=i,
                code_snippet=stripped,
                estimated_saving="~0 gas (quality)",
                recommendation=(
                    'require(condition, "error message");'
                ),
            ))

        # 6. Лишняя инициализация default значений
        if re.search(r'(uint\s+\w+\s*=\s*0|bool\s+\w+\s*=\s*false)', stripped):
            issues.append(GasIssue(
                title="Unnecessary default value initialization",
                description=(
                    "Переменные Solidity уже инициализированы "
                    "значениями по умолчанию. Явная установка "
                    "тратит газ."
                ),
                line_start=i,
                line_end=i,
                code_snippet=stripped,
                estimated_saving="~200 gas",
                recommendation=(
                    "Удалите `= 0` / `= false`. "
                    "uint a; // уже 0"
                ),
            ))

        # 7. Mantle L2: calldata вместо memory для параметров
        if re.search(r'function\s+\w+\s*\(', stripped):
            # Ищем в сигнатуре функции memory параметры
            for j in range(i, min(i + 5, len(lines))):
                if re.search(r'(string|bytes|\[\])\s+memory\s+\w+', lines[j]):
                    issues.append(GasIssue(
                        title="Mantle L2: Use calldata instead of memory for read-only params",
                        description=(
                            "На Mantle L2 calldata дешевле memory для "
                            "параметров внешних функций."
                        ),
                        line_start=j,
                        line_end=j,
                        code_snippet=lines[j].strip(),
                        estimated_saving="~100 gas per call on Mantle L2",
                        recommendation=(
                            "Замените `memory` на `calldata` для "
                            "неизменяемых параметров."
                        ),
                    ))
                    break

    return issues
