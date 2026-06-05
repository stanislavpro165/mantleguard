"""Детектор Selfdestruct (SWC-106)."""

from . import BaseDetector
from ..models.report import AnalysisReport,  Vulnerability, Severity, VulnerabilityType
from ..parser import ContractInfo


class SelfdestructDetector(BaseDetector):
    name = "Selfdestruct Detector"
    description = "Ищет использование selfdestruct в контракте."

    def detect(self, contract: ContractInfo, report: AnalysisReport) -> None:
        if 'selfdestruct' in contract.source:
            v = Vulnerability(
                type=VulnerabilityType.SELFDESTRUCT,
                severity=Severity.HIGH,
                title="Selfdestruct Present",
                description=(
                    "Контракт содержит selfdestruct. Это позволяет "
                    "уничтожить контракт и отправить весь оставшийся "
                    "ETH на указанный адрес."
                ),
                line_start=0,
                line_end=1,
                code_snippet="contract contains selfdestruct",
                recommendation=(
                    "1. Убедитесь что selfdestruct защищён onlyOwner\n"
                    "2. Рассмотрите возможность удаления, если selfdestruct "
                    "не критичен для логики\n"
                    "3. Помните что selfdestruct может сломать интеграции"
                ),
                swc_id="SWC-106",
            )
            report.vulnerabilities.append(v)
