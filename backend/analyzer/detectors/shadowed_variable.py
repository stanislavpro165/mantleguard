"""Детектор Shadowed Variable (SWC-119)."""

import re
from . import BaseDetector
from ..models.report import AnalysisReport,  Vulnerability, Severity, VulnerabilityType
from ..parser import ContractInfo


class ShadowedVariableDetector(BaseDetector):
    name = "Shadowed Variable Detector"
    description = (
        "Ищет локальные переменные, перекрывающие имена "
        "state-переменных (shadowing)."
    )

    def detect(self, contract: ContractInfo, report: AnalysisReport) -> None:
        state_var_names = {v['name'] for v in contract.state_vars}

        for func in contract.functions:
            body = func['body']
            for var_name in state_var_names:
                # Ищем объявление локальной переменной с тем же именем
                pattern = re.compile(
                    rf'(uint|int|address|bool|string|bytes\d*)\s+'
                    rf'{re.escape(var_name)}\b'
                )
                if pattern.search(body):
                    v = Vulnerability(
                        type=VulnerabilityType.SHADOWED_VARIABLE,
                        severity=Severity.LOW,
                        title=f"Shadowed Variable: {var_name}",
                        description=(
                            f"Локальная переменная `{var_name}` перекрывает "
                            "одноимённую state-переменную. Это может привести "
                            "к путанице и некорректным изменениям состояния."
                        ),
                        line_start=func['line'],
                        line_end=func['line'],
                        code_snippet=f"{func['line']}: {body.split(chr(10))[0]}",
                        recommendation=(
                            "Используйте разные имена для локальных и "
                            "state-переменных. Например, добавьте префикс "
                            "'_' или 'm_' для state-переменных."
                        ),
                        swc_id="SWC-119",
                    )
                    report.vulnerabilities.append(v)
