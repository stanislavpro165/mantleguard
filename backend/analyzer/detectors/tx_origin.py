"""Детектор Tx.origin Authentication (SWC-115)."""

import re
from . import BaseDetector
from ..models.report import AnalysisReport,  Vulnerability, Severity, VulnerabilityType
from ..parser import ContractInfo


class TxOriginDetector(BaseDetector):
    name = "Tx.origin Detector"
    description = "Ищет использование tx.origin в require/if для аутентификации."

    def detect(self, contract: ContractInfo, report: AnalysisReport) -> None:
        for func in contract.functions:
            body = func['body']
            if re.search(r'tx\.origin', body):
                v = Vulnerability(
                    type=VulnerabilityType.TX_ORIGIN,
                    severity=Severity.MEDIUM,
                    title="Tx.origin for Authentication",
                    description=(
                        "Использование tx.origin для аутентификации опасно. "
                        "При вызове через контракт-посредник tx.origin "
                        "указывает на исходного отправителя, а не на "
                        "контракт-посредник, что позволяет атакам фишинга."
                    ),
                    line_start=func['line'],
                    line_end=func['line'],
                    code_snippet=f"{func['line']}: {body.split(chr(10))[0]}",
                    recommendation=(
                        "Используйте msg.sender вместо tx.origin для аутентификации.\n"
                        "tx.origin подходит только для случаев когда нужно узнать "
                        "кто инициировал транзакцию (например, для отказа от ERC20)."
                    ),
                    swc_id="SWC-115",
                )
                report.vulnerabilities.append(v)
