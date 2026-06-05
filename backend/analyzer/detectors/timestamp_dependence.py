"""Детектор Timestamp Dependence (SWC-116)."""

from . import BaseDetector
from ..models.report import AnalysisReport,  Vulnerability, Severity, VulnerabilityType
from ..parser import ContractInfo


class TimestampDependenceDetector(BaseDetector):
    name = "Timestamp Dependence Detector"
    description = (
        "Ищет использование block.timestamp в сравнениях, "
        "которое может быть незначительно изменено майнером."
    )

    def detect(self, contract: ContractInfo, report: AnalysisReport) -> None:
        for func in contract.functions:
            body = func['body']
            if 'block.timestamp' in body and '==' in body or \
               'block.timestamp' in body and '!=' in body or \
               'block.timestamp' in body and '>' in body or \
               'block.timestamp' in body and '<' in body or \
               'now' in body and '==' in body or \
               'now' in body and '>' in body:
                v = Vulnerability(
                    type=VulnerabilityType.TIMESTAMP_DEPENDENCE,
                    severity=Severity.LOW,
                    title="Timestamp Dependence",
                    description=(
                        "Использование block.timestamp или now в сравнениях. "
                        "Майнер может незначительно изменить timestamp "
                        "(в пределах нескольких секунд) в свою пользу."
                    ),
                    line_start=func['line'],
                    line_end=func['line'],
                    code_snippet=f"{func['line']}: {body.split(chr(10))[0]}",
                    recommendation=(
                        "1. Не используйте block.timestamp для критических проверок\n"
                        "2. Для временных блокировок используйте block.number + среднее время блока\n"
                        "3. Если используете — учитывайте допуск в несколько секунд"
                    ),
                    swc_id="SWC-116",
                )
                report.vulnerabilities.append(v)
