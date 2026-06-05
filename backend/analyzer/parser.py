"""Solidity парсер — ядро анализатора.

Стратегия:
1. Пытаемся получить AST через solc --ast-json (точный)
2. Если solc нет — regex-based парсинг для MVP
3. Результат: унифицированное AST-like представление
"""

import re
import json
import subprocess
import tempfile
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, field


@dataclass
class ContractInfo:
    source: str
    name: str = ""
    functions: List[Dict[str, Any]] = field(default_factory=list)
    state_vars: List[Dict[str, Any]] = field(default_factory=list)
    modifiers: List[Dict[str, Any]] = field(default_factory=list)
    imports: List[str] = field(default_factory=list)
    inheritance: List[str] = field(default_factory=list)
    lines: List[str] = field(default_factory=list)
    ast: Optional[Dict] = None
    has_ast: bool = False


def get_ast_via_solc(source: str) -> Optional[Dict]:
    """Попытка получить AST через solc --ast-json."""
    for flag in ['--ast-json', '--ast-compact-json']:
        try:
            with tempfile.NamedTemporaryFile(
                suffix='.sol', mode='w', encoding='utf-8', delete=False
            ) as f:
                f.write(source)
                tmp_path = f.name

            result = subprocess.run(
                ['solc', flag, tmp_path],
                capture_output=True, text=True, timeout=15
            )
            Path(tmp_path).unlink(missing_ok=True)

            if result.returncode == 0 and result.stdout.strip():
                ast_json = json.loads(result.stdout.strip())
                return ast_json
        except (subprocess.TimeoutExpired, FileNotFoundError, json.JSONDecodeError):
            pass

    return None


class RegexParser:
    """Regex-based парсер Solidity для MVP."""

    # Паттерны
    RE_FUNCTION = re.compile(
        r'function\s+(\w+)\s*\(([^)]*)\)\s*'
        r'((?:public|private|internal|external)(?:\s+view|\s+pure|\s+payable)?)'
        r'(?:\s*(virtual|override))?'
        r'\s*(?:returns\s*\(([^)]*)\))?'
        r'\s*\{',
        re.DOTALL
    )

    RE_MODIFIER = re.compile(
        r'modifier\s+(\w+)\s*\(([^)]*)\)\s*\{'
    )

    RE_STATE_VAR = re.compile(
        r'(?:mapping\s*\([^)]+\)\s*|(\w+(?:\[\])?(?:\s*<\s*\w+\s*>)?))\s+'
        r'(?:public|private|internal)?\s*'
        r'(\w+)\s*(?:=\s*([^;]+))?\s*;'
    )

    RE_IMPORT = re.compile(
        r"import\s+(?:\{[^}]*\}\s+from\s+)?['\"]([^'\"]+)['\"]\s*;"
    )

    RE_INHERITANCE = re.compile(
        r'contract\s+\w+\s+is\s+([^{]+)\s*\{'
    )

    RE_CONTRACT_NAME = re.compile(
        r'^\s*contract\s+(\w+)',
        re.MULTILINE
    )

    RE_EVENT = re.compile(
        r'event\s+(\w+)\s*\(([^)]*)\)\s*;'
    )

    RE_REQUIRE = re.compile(r'\brequire\s*\(')
    RE_REVERT = re.compile(r'\brevert\s*\(')
    RE_ASSERT = re.compile(r'\bassert\s*\(')
    RE_EXTERNAL_CALL = re.compile(r'\.call\s*\{')
    RE_DELEGATECALL = re.compile(r'\.delegatecall\s*\(')
    RE_TX_ORIGIN = re.compile(r'tx\.origin')
    RE_SELFDESTRUCT = re.compile(r'\bselfdestruct\b')
    RE_BLOCK_TIMESTAMP = re.compile(r'block\.timestamp')
    RE_BLOCK_NUMBER = re.compile(r'block\.number')
    RE_ETHER_TRANSFER = re.compile(r'\.(call|transfer|send)\s*\{value')

    def parse(self, source: str) -> ContractInfo:
        lines = source.split('\n')

        # Сначала находим название
        name = ""
        m = self.RE_CONTRACT_NAME.search(source)
        if m:
            name = m.group(1)

        info = ContractInfo(
            source=source,
            name=name,
            lines=lines,
        )

        # Импорты
        info.imports = self.RE_IMPORT.findall(source)

        # Наследование
        m = self.RE_INHERITANCE.search(source)
        if m:
            parents = m.group(1).strip()
            info.inheritance = [p.strip() for p in parents.split(',')]

        # Функции
        for m in self.RE_FUNCTION.finditer(source):
            func = {
                'name': m.group(1).strip(),
                'params': m.group(2).strip(),
                'visibility': m.group(3).strip(),
                'modifiers': m.group(4).strip() if m.group(4) else '',
                'returns': m.group(5).strip() if m.group(5) else '',
                'line': self._get_line_number(lines, m.group(0)),
                'body': m.group(0),
                'has_require': bool(self.RE_REQUIRE.search(m.group(0))),
                'has_external_call': bool(self.RE_EXTERNAL_CALL.search(m.group(0))),
                'has_payable': 'payable' in m.group(0),
            }

            # Определяем модификаторы доступа (onlyOwner etc)
            modifier_pattern = re.search(r'\)\s*(\w+)', m.group(0))
            if modifier_pattern:
                mod = modifier_pattern.group(1)
                if mod and mod not in ('public', 'private', 'internal', 'external',
                                        'view', 'pure', 'payable', 'virtual',
                                        'override', 'returns'):
                    func['access_modifier'] = mod

            info.functions.append(func)

        # Модификаторы
        for m in self.RE_MODIFIER.finditer(source):
            info.modifiers.append({
                'name': m.group(1).strip(),
                'params': m.group(2).strip(),
            })

        # State variables (приблизительно)
        for m in self.RE_STATE_VAR.finditer(source):
            info.state_vars.append({
                'type': m.group(1).strip() if m.group(1) else 'mapping',
                'name': m.group(2).strip(),
                'initial_value': m.group(3).strip() if m.group(3) else '',
            })

        return info

    def _get_line_number(self, lines: List[str], pattern: str) -> int:
        """Найти примерную строку где находится паттерн."""
        for i, line in enumerate(lines, 1):
            if pattern[:50] in line or line.strip() and pattern[:30] in line:
                return i
        return 1


def parse_contract(source: str) -> ContractInfo:
    """Главная функция парсинга. Пробует AST, падает на regex."""
    ast = get_ast_via_solc(source)
    parser = RegexParser()
    info = parser.parse(source)
    info.ast = ast
    info.has_ast = ast is not None
    return info
