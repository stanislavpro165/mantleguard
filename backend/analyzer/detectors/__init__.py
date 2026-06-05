"""Все детекторы уязвимостей Solidity."""

from typing import List
from ..models.report import AnalysisReport,  Vulnerability, AnalysisReport
from ..parser import ContractInfo


class BaseDetector:
    """Базовый класс детектора."""

    name: str = ""
    description: str = ""

    def detect(self, contract: ContractInfo, report: AnalysisReport) -> None:
        """Запустить детектор. Мутирует report."""
        raise NotImplementedError


# Re-export for use in detector modules
__all__ = ['BaseDetector', 'AnalysisReport', 'Vulnerability', 'ContractInfo']


def run_all_detectors(contract: ContractInfo) -> AnalysisReport:
    """Запустить все детекторы на контракте."""
    from . import (  # lazy import чтобы избежать циклов
        reentrancy,
        access_control,
        unchecked_call,
        integer_overflow,
        tx_origin,
        timestamp_dependence,
        gas_griefing,
        delegatecall,
        selfdestruct,
        shadowed_variable,
        unused_return,
    )

    report = AnalysisReport(
        contract_name=contract.name,
        source_length=len(contract.source),
    )

    detectors: List[BaseDetector] = [
        reentrancy.ReentrancyDetector(),
        access_control.AccessControlDetector(),
        unchecked_call.UncheckedCallDetector(),
        integer_overflow.IntegerOverflowDetector(),
        tx_origin.TxOriginDetector(),
        timestamp_dependence.TimestampDependenceDetector(),
        gas_griefing.GasGriefingDetector(),
        delegatecall.DelegatecallDetector(),
        selfdestruct.SelfdestructDetector(),
        shadowed_variable.ShadowedVariableDetector(),
        unused_return.UnusedReturnDetector(),
    ]

    for det in detectors:
        det.detect(contract, report)
        report.detectors_run += 1

    return report
