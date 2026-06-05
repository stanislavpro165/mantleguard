"""Детектор Unsafe Delegatecall (SWC-112)."""

from . import BaseDetector
from ..models.report import AnalysisReport,  Vulnerability, Severity, VulnerabilityType
from ..parser import ContractInfo


class DelegatecallDetector(BaseDetector):
    name = "Delegatecall Detector"
    description = "Ищет delegatecall в адрес, который может быть изменён."

    def detect(self, contract: ContractInfo, report: AnalysisReport) -> None:
        for func in contract.functions:
            body = func['body']
            if '.delegatecall' in body:
                # Проверяем что адрес не хардкод
                has_hardcoded = False
                for line in body.split('\n'):
                    if 'delegatecall' in line:
                        # Адрес передаётся как параметр или переменная
                        if '(' in line:
                            call_target = line.split('delegatecall')[0].strip()
                            # Если target не константа и не tx.origin
                            if call_target.endswith('('):
                                continue
                            if not any(
                                x in call_target
                                for x in ['address(', '0x']
                            ):
                                v = Vulnerability(
                                    type=VulnerabilityType.DELEGATECALL,
                                    severity=Severity.CRITICAL,
                                    title="Unsafe Delegatecall",
                                    description=(
                                        "delegatecall с переменным адресом. "
                                        "Целевой контракт получает полный "
                                        "контроль над storage вызывающего."
                                    ),
                                    line_start=func['line'],
                                    line_end=func['line'],
                                    code_snippet=f"{func['line']}: {func['body'].split(chr(10))[0]}",
                                    recommendation=(
                                        "1. Используйте delegatecall только с hardcoded адресами\n"
                                        "2. Добавьте whitelist допустимых адресов\n"
                                        "3. Никогда не позволяйте пользователю указывать target"
                                    ),
                                    swc_id="SWC-112",
                                )
                                report.vulnerabilities.append(v)
