"""Модели данных для отчёта аудита"""

from dataclasses import dataclass, field
from enum import Enum
from typing import List, Optional


class Severity(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    GAS = "GAS"
    INFO = "INFO"


class VulnerabilityType(str, Enum):
    REENTRANCY = "reentrancy"
    ACCESS_CONTROL = "access_control"
    UNCHECKED_CALL = "unchecked_call"
    INTEGER_OVERFLOW = "integer_overflow"
    TX_ORIGIN = "tx_origin"
    TIMESTAMP_DEPENDENCE = "timestamp_dependence"
    GAS_GRIEFING = "gas_griefing"
    UNINITIALIZED_STORAGE = "uninitialized_storage"
    DELEGATECALL = "delegatecall"
    SELFDESTRUCT = "selfdestruct"
    SHADOWED_VARIABLE = "shadowed_variable"
    UNUSED_RETURN = "unused_return"


@dataclass
class Vulnerability:
    type: VulnerabilityType
    severity: Severity
    title: str
    description: str
    line_start: int
    line_end: int
    code_snippet: str
    recommendation: str
    swc_id: Optional[str] = None


@dataclass
class GasIssue:
    title: str
    description: str
    line_start: int
    line_end: int
    code_snippet: str
    estimated_saving: str
    recommendation: str


@dataclass
class DetectorMetadata:
    name: str
    vulnerability_types: List[VulnerabilityType]
    description: str
    is_ast_based: bool = True


@dataclass
class AnalysisReport:
    contract_name: str
    source_length: int
    vulnerabilities: List[Vulnerability] = field(default_factory=list)
    gas_issues: List[GasIssue] = field(default_factory=list)
    detectors_run: int = 0

    @property
    def severity_count(self) -> dict:
        counts = {}
        for v in self.vulnerabilities:
            s = v.severity.value
            counts[s] = counts.get(s, 0) + 1
        return counts

    @property
    def total_issues(self) -> int:
        return len(self.vulnerabilities) + len(self.gas_issues)

    @property
    def score(self) -> int:
        """Risk score 0-100. 100 = worst."""
        weights = {
            Severity.CRITICAL: 40,
            Severity.HIGH: 20,
            Severity.MEDIUM: 10,
            Severity.LOW: 3,
            Severity.GAS: 1,
            Severity.INFO: 0,
        }
        score = 0
        for v in self.vulnerabilities:
            score += weights.get(v.severity, 0)
        return min(score, 100)
