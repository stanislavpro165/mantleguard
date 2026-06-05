"""Детектор Unchecked External Call (SWC-104)."""

import re
from . import BaseDetector
from ..models.report import AnalysisReport,  Vulnerability, Severity, VulnerabilityType
from ..parser import ContractInfo


class UncheckedCallDetector(BaseDetector):
    name = "Unchecked Call Detector"
    description = (
        "Ищет вызовы .call(), .delegatecall(), .send() без проверки "
        "возвращаемого значения."
    )

    def detect(self, contract: ContractInfo, report: AnalysisReport) -> None:
        lines = contract.lines

        for i, line in enumerate(lines, 1):
            # Ищем .call{...}(...) или .send(...) без require/if
            if '.call{' in line or '.call(' in line or '.send(' in line:

                # Пропускаем если есть require или if перед вызовом
                context_before = '\n'.join(lines[max(0, i - 3):i])

                has_check = bool(
                    re.search(r'(require|if|assert)\s*\(', context_before)
                ) and bool(
                    # Проверяем что чек относится к этому вызову
                    re.search(r'success|ok|result', context_before)
                )

                # Проверяем что возвращаемое значение не проверяется
                # (address.call() возвращает (bool, bytes))
                next_line = lines[i] if i < len(lines) else ''
                has_require_after = bool(
                    re.search(r'require\s*\(', next_line)
                ) or bool(re.search(r'if\s*\(', next_line))

                if not has_check and not has_require_after:
                    v = Vulnerability(
                        type=VulnerabilityType.UNCHECKED_CALL,
                        severity=Severity.MEDIUM,
                        title="Unchecked External Call",
                        description=(
                            "Результат внешнего вызова не проверяется. "
                            "Если вызов неудачен, транзакция не откатывается, "
                            "что может привести к некорректному состоянию."
                        ),
                        line_start=i,
                        line_end=i,
                        code_snippet=f"{i}: {line.strip()}",
                        recommendation=(
                            "1. Проверяйте возвращаемое значение:\n"
                            "   (bool success, ) = address.call{value: x}('');\n"
                            "   require(success, 'call failed');\n"
                            "2. Используйте реверт-паттерн вместо игнорирования"
                        ),
                        swc_id="SWC-104",
                    )
                    report.vulnerabilities.append(v)
