"""Детектор Missing Access Control (SWC-105)."""

import re
from . import BaseDetector
from ..models.report import AnalysisReport,  Vulnerability, Severity, VulnerabilityType
from ..parser import ContractInfo


class AccessControlDetector(BaseDetector):
    name = "Access Control Detector"
    description = (
        "Ищет public/external функции, которые не имеют модификаторов "
        "доступа (onlyOwner, onlyRole и т.д.) и меняют состояние."
    )

    # Стандартные модификаторы доступа
    ACCESS_MODIFIERS = {
        'onlyOwner', 'onlyRole', 'onlyAdmin', 'auth', 'only',
        'whenNotPaused', 'whenPaused', 'isAuthorized', 'hasRole',
        'onlyDelegate', 'onlyVault', 'onlyController', 'onlyManager',
        'onlySigner', 'permissioned',
    }

    # Функции-исключения (конструктор, receive, fallback, view, pure)
    EXEMPT_FUNCTIONS = {'constructor', 'receive', 'fallback'}

    def detect(self, contract: ContractInfo, report: AnalysisReport) -> None:
        known_modifiers = {m['name'] for m in contract.modifiers}
        all_modifiers = known_modifiers | self.ACCESS_MODIFIERS

        for func in contract.functions:
            name = func['name']
            visibility = func['visibility']
            body = func['body']

            # Пропускаем исключения
            if name in self.EXEMPT_FUNCTIONS:
                continue

            # Проверяем только public/external которые меняют состояние
            if 'public' not in visibility and 'external' not in visibility:
                continue

            if 'view' in visibility or 'pure' in visibility:
                continue

            # Проверяем есть ли модификатор доступа
            has_access = any(
                mod in body or mod in func.get('access_modifier', '')
                for mod in all_modifiers
            )

            # Дополнительно проверяем require(msg.sender == ...)
            has_sender_check = bool(
                re.search(r'require\s*\(\s*msg\.sender\s*==', body)
            )

            # Проверяем функцию на наличие external call (может быть protected)
            if not has_access and not has_sender_check:
                v = Vulnerability(
                    type=VulnerabilityType.ACCESS_CONTROL,
                    severity=Severity.HIGH,
                    title=f"Missing Access Control: {name}()",
                    description=(
                        f"Функция `{name}` объявлена как `{visibility}`, "
                        "но не имеет модификаторов ограничения доступа. "
                        "Любой может вызвать эту функцию."
                    ),
                    line_start=func['line'],
                    line_end=func['line'] + 1,
                    code_snippet=f"{func['line']}: {body.split(chr(10))[0]}",
                    recommendation=(
                        "1. Добавьте модификатор onlyOwner или onlyRole\n"
                        "2. Если функция должна быть публичной — добавьте "
                        "require проверку msg.sender\n"
                        "3. Рассмотрите изменение visibility на internal"
                    ),
                    swc_id="SWC-105",
                )
                report.vulnerabilities.append(v)
