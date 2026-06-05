"""Детектор Reentrancy (SWC-107)."""

import re
from typing import List
from . import BaseDetector
from ..models.report import AnalysisReport,  Vulnerability, Severity, VulnerabilityType, AnalysisReport
from ..parser import ContractInfo


class ReentrancyDetector(BaseDetector):
    name = "Reentrancy Detector"
    description = (
        "Ищет паттерн: внешний вызов (call/transfer) после изменения состояния, "
        "что позволяет повторно войти в функцию до завершения первого вызова."
    )

    def detect(self, contract: ContractInfo, report: AnalysisReport) -> None:
        source = contract.source

        # Ищем функции с шаблоном:
        # 1. Эфирный перевод (call{value}, transfer, send)
        # 2. После изменения storage переменной
        # 3. Без reentrancy guard

        # Простой паттерн: .call{value} или .transfer в функции + state change перед ним
        ether_call_pattern = re.compile(
            r'(?:\.call\s*\{[^}]*value|\.transfer|\.send)\s*\('
        )

        for func in contract.functions:
            func_body = func['body']
            func_lines = func_body.split('\n')
            func_start = func['line']

            # Ищем ether transfer в теле функции
            for match in ether_call_pattern.finditer(func_body):
                # Проверяем что это не protected (noReentrant, mutex lock и т.д.)
                if 'noReentrant' in func_body or 'nonReentrant' in func_body \
                   or 'reentrancyGuard' in func_body.lower():
                    continue

                # Проверяем что перед вызовом есть изменение storage
                # (приблизительно — ищем assignment до вызова)
                call_pos = match.start()
                before_call = func_body[:call_pos]

                storage_change = bool(re.search(
                    r'(?:mapping|storage|uint|bool|address)\s*\w+\s*[=]',
                    before_call
                )) or bool(re.search(
                    r'(\w+(?:\[\w+\])?)\s*[=]\s*\w+',
                    before_call
                ))

                if storage_change:
                    v = Vulnerability(
                        type=VulnerabilityType.REENTRANCY,
                        severity=Severity.CRITICAL,
                        title="Reentrancy Vulnerability",
                        description=(
                            "Функция совершает внешний вызов после изменения "
                            "состояния, что позволяет атакующему повторно войти "
                            "в контракт до завершения первого вызова (Reentrancy)."
                        ),
                        line_start=func_start,
                        line_end=func_start + len(func_lines),
                        code_snippet=self._extract_snippet(
                            contract.lines, func_start, 5
                        ),
                        recommendation=(
                            "1. Используйте паттерн Checks-Effects-Interactions\n"
                            "2. Добавьте reentrancy guard (модификатор nonReentrant от OpenZeppelin)\n"
                            "3. Перенесите внешние вызовы в самый конец функции"
                        ),
                        swc_id="SWC-107",
                    )
                    report.vulnerabilities.append(v)

    def _extract_snippet(
        self, lines: List[str], start_line: int, context: int = 3
    ) -> str:
        """Извлечь кусок кода вокруг строки."""
        idx = start_line - 1
        begin = max(0, idx - context)
        end = min(len(lines), idx + context)
        return '\n'.join(
            f"{i + 1}: {lines[i]}"
            for i in range(begin, end)
        )
