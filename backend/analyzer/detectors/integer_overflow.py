"""Детектор Integer Overflow/Underflow (SWC-101)."""

import re
from . import BaseDetector
from ..models.report import AnalysisReport,  Vulnerability, Severity, VulnerabilityType
from ..parser import ContractInfo


class IntegerOverflowDetector(BaseDetector):
    name = "Integer Overflow Detector"
    description = (
        "Ищет арифметические операции без защиты от переполнения "
        "(до Solidity 0.8 встроенной проверки нет)."
    )

    # Solidity 0.8+ по умолчанию проверяет overflow
    RE_SOL_VERSION = re.compile(r'pragma\s+solidity\s+([\d.]+)')

    def detect(self, contract: ContractInfo, report: AnalysisReport) -> None:
        source = contract.source

        # Проверяем версию Solidity
        ver_match = self.RE_SOL_VERSION.search(source)
        if ver_match:
            try:
                version = ver_match.group(1).split('.')
                major, minor = int(version[0]), int(version[1])
                # Solidity 0.8+ имеет встроенную проверку
                if major > 0 or (major == 0 and minor >= 8):
                    return
            except (ValueError, IndexError):
                pass

        # Ищем арифметику без unchecked блоков
        # (в Solidity 0.8+ unchecked позволяет overflow)
        arith_pattern = re.compile(
            r'(\w+)\s*[+\-*/]\s*=\s*\w+|'
            r'(\w+)\s*=\s*\w+\s*[+\-*/]\s*\w+|'
            r'\w+\+\+|\+\+\w+|\w+--|--\w+'
        )

        # Ищем в функциях
        for func in contract.functions:
            if 'view' in func['visibility'] or 'pure' in func['visibility']:
                continue

            body = func['body']
            matches = list(arith_pattern.finditer(body))

            # Проверяем что не в unchecked блоке
            in_unchecked = body.count('unchecked') > 0

            if matches and not in_unchecked:
                first = matches[0]
                line_no = func['line']

                v = Vulnerability(
                    type=VulnerabilityType.INTEGER_OVERFLOW,
                    severity=Severity.MEDIUM,
                    title="Potential Integer Overflow",
                    description=(
                        "Арифметическая операция может привести к "
                        "переполнению. Версия Solidity < 0.8 не имеет "
                        "встроенной проверки overflow/underflow."
                    ),
                    line_start=line_no,
                    line_end=line_no,
                    code_snippet=f"{line_no}: {body.split(chr(10))[0]}",
                    recommendation=(
                        "1. Используйте Solidity ^0.8.0 для встроенной проверки\n"
                        "2. Используйте SafeMath библиотеку OpenZeppelin\n"
                        "3. Или оберните в unchecked { } если overflow ожидаем"
                    ),
                    swc_id="SWC-101",
                )
                report.vulnerabilities.append(v)
                break
