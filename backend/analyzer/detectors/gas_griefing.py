"""Детектор Gas Griefing (SWC-126)."""

from . import BaseDetector
from ..models.report import AnalysisReport,  Vulnerability, Severity, VulnerabilityType
from ..parser import ContractInfo


class GasGriefingDetector(BaseDetector):
    name = "Gas Griefing Detector"
    description = (
        "Ищет unbounded циклы в функциях, которые могут быть "
        "использованы для исчерпания газа (gas griefing)."
    )

    def detect(self, contract: ContractInfo, report: AnalysisReport) -> None:
        for func in contract.functions:
            body = func['body']
            body_lines = body.split('\n')

            # Ищем циклы for/while с динамическими границами
            for i, line in enumerate(body_lines):
                stripped = line.strip()

                # for(uint i = 0; i < array.length; i++)
                if 'for' in stripped and '.length' in stripped:
                    v = Vulnerability(
                        type=VulnerabilityType.GAS_GRIEFING,
                        severity=Severity.MEDIUM,
                        title="Unbounded Loop (Gas Griefing)",
                        description=(
                            "Цикл использует динамическую длину массива. "
                            "Если массив станет большим, транзакция может "
                            "исчерпать газ или быть заблокирована."
                        ),
                        line_start=func['line'] + i,
                        line_end=func['line'] + i,
                        code_snippet=f"{func['line'] + i}: {stripped}",
                        recommendation=(
                            "1. Ограничьте размер цикла константой\n"
                            "2. Используйте pull-based паттерн вместо push\n"
                            "3. Добавьте возможность pagination/limit"
                        ),
                        swc_id="SWC-126",
                    )
                    report.vulnerabilities.append(v)
