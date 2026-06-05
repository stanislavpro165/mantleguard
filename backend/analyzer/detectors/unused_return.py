"""Детектор Unused Return Value (SWC-104)."""

import re
from . import BaseDetector
from ..models.report import AnalysisReport,  Vulnerability, Severity, VulnerabilityType
from ..parser import ContractInfo


class UnusedReturnDetector(BaseDetector):
    name = "Unused Return Detector"
    description = (
        "Ищет вызовы внешних функций, чьи возвращаемые значения "
        "не используются."
    )

    def detect(self, contract: ContractInfo, report: AnalysisReport) -> None:
        # Ищем вызовы функций которые возвращают значение
        # но оно не присваивается переменной
        patterns = [
            r'\.(transfer|send)\s*\(',
            r'(I[A-Z]\w+)\.(\w+)\s*\(',
            r'(address|IERC20|IERC721)\([^)]+\)\.(\w+)\(',
        ]

        for func in contract.functions:
            body = func['body']
            lines = body.split('\n')

            for i, line in enumerate(lines):
                # Проверяем что вызов не присваивается
                for pat in patterns:
                    m = re.search(pat, line)
                    if m:
                        # Проверяем что это не внутри require/if и не присвоение
                        stripped = line.strip()
                        if not stripped.startswith('(') and \
                           not stripped.startswith('uint') and \
                           not stripped.startswith('bool') and \
                           not stripped.startswith('address') and \
                           '=' not in stripped[:stripped.find(m.group()) if m else 0]:
                            v = Vulnerability(
                                type=VulnerabilityType.UNUSED_RETURN,
                                severity=Severity.LOW,
                                title="Unused Return Value",
                                description=(
                                    "Возвращаемое значение внешнего вызова "
                                    "игнорируется. Это может маскировать ошибки."
                                ),
                                line_start=func['line'] + i,
                                line_end=func['line'] + i,
                                code_snippet=f"{func['line'] + i}: {stripped}",
                                recommendation=(
                                    "Проверяйте возвращаемые значения внешних "
                                    "вызовов через require или if."
                                ),
                                swc_id="SWC-104",
                            )
                            report.vulnerabilities.append(v)
