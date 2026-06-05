#!/usr/bin/env python3
"""MantleGuard CLI — аудит смарт-контрактов из терминала."""

import sys
import json
import os
from pathlib import Path

# Добавляем backend в путь
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from analyzer.parser import parse_contract
from analyzer.detectors import run_all_detectors
from analyzer.gas_optimizer import analyze_gas


def print_report(report, contract_name: str, format: str = "text"):
    """Вывести отчёт."""
    if format == "json":
        output = {
            "contract": contract_name,
            "score": report.score,
            "total_issues": report.total_issues,
            "detectors_run": report.detectors_run,
            "severity_summary": report.severity_count,
            "vulnerabilities": [
                {
                    "severity": v.severity.value,
                    "title": v.title,
                    "type": v.type.value,
                    "line": v.line_start,
                    "swc": v.swc_id,
                    "description": v.description,
                    "recommendation": v.recommendation,
                }
                for v in report.vulnerabilities
            ],
            "gas_issues": [
                {
                    "title": g.title,
                    "line": g.line_start,
                    "saving": g.estimated_saving,
                    "recommendation": g.recommendation,
                }
                for g in report.gas_issues
            ],
        }
        print(json.dumps(output, indent=2, ensure_ascii=False))
        return

    # Text format
    print("+================================================+")
    print(f"|  MantleGuard -- Security Audit                    |")
    print(f"|  Contract: {contract_name:<35s} |")
    print("+================================================+")
    print()

    # Score
    score_color = "🟢" if report.score < 30 else "🟡" if report.score < 60 else "🔴"
    print(f"  Risk Score: {score_color} {report.score}/100")
    print(f"  Detectors : {report.detectors_run}")
    print(f"  Issues    : {report.total_issues}")
    print()

    # Severity summary
    sev = report.severity_count
    print("  Severity Breakdown:")
    for s in ["CRITICAL", "HIGH", "MEDIUM", "LOW", "GAS"]:
        count = sev.get(s, 0)
        if count > 0:
            icon = {"CRITICAL": "🔥", "HIGH": "🔴", "MEDIUM": "🟡", "LOW": "🔵", "GAS": "⛽"}
            print(f"    {icon.get(s, '•')} {s:<10} {count}")
    print()

    # Vulnerabilities
    if report.vulnerabilities:
        print("  ─── Vulnerabilities ───")
        for i, v in enumerate(report.vulnerabilities, 1):
            icon = {"CRITICAL": "🔥", "HIGH": "🔴", "MEDIUM": "🟡", "LOW": "🔵", "GAS": "⛽", "INFO": "ℹ️"}
            print(f"\n  {i}. {icon.get(v.severity.value, '•')} [{v.severity.value}] {v.title}")
            print(f"     Line {v.line_start} · {v.swc_id or 'N/A'}")
            print(f"     {v.description}")
            print(f"     → {v.recommendation.split(chr(10))[0]}")

    # Gas issues
    if report.gas_issues:
        print(f"\n  ─── Gas Optimizations ({len(report.gas_issues)}) ───")
        for g in report.gas_issues:
            print(f"\n  ⛽ {g.title}")
            print(f"     Line {g.line_start} · Save: {g.estimated_saving}")
            print(f"     → {g.recommendation.split(chr(10))[0]}")

    print()


def main():
    import argparse

    parser = argparse.ArgumentParser(
        description="MantleGuard — AI Security Agent for Solidity Smart Contracts",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  mantleguard audit Contract.sol              # Full audit
  mantleguard audit Contract.sol --json       # JSON output for CI
  mantleguard fix Contract.sol -o Fixed.sol   # Auto-fix
  mantleguard gas Contract.sol                # Gas only
  mantleguard init                            # Create test contract
        """,
    )

    subparsers = parser.add_subparsers(dest="command", help="Command")

    # audit
    audit_parser = subparsers.add_parser("audit", help="Audit a contract")
    audit_parser.add_argument("file", help="Path to .sol file")
    audit_parser.add_argument("--json", action="store_true", help="JSON output")
    audit_parser.add_argument("--output", "-o", help="Save report to file")

    # fix
    fix_parser = subparsers.add_parser("fix", help="Generate fixed version")
    fix_parser.add_argument("file", help="Path to .sol file")
    fix_parser.add_argument("--output", "-o", required=True, help="Output file")

    # gas
    gas_parser = subparsers.add_parser("gas", help="Gas analysis only")
    gas_parser.add_argument("file", help="Path to .sol file")
    gas_parser.add_argument("--json", action="store_true", help="JSON output")

    # init
    subparsers.add_parser("init", help="Create demo contract with vulnerabilities")

    args = parser.parse_args()

    if args.command == "init":
        _cmd_init()
        return

    # Read file
    filepath = args.file
    if not os.path.exists(filepath):
        print(f"❌ File not found: {filepath}")
        sys.exit(1)

    with open(filepath, "r", encoding="utf-8") as f:
        source = f.read()

    contract = parse_contract(source)

    if args.command == "gas":
        issues = analyze_gas(source)
        if args.json:
            print(json.dumps([{
                "title": g.title,
                "line": g.line_start,
                "saving": g.estimated_saving,
            } for g in issues], indent=2))
        else:
            print(f"\n⛽ Gas Analysis: {len(issues)} issues found\n")
            for g in issues:
                print(f"  [{g.line_start}] {g.title}")
                print(f"       Save: {g.estimated_saving}")
                print()
        return

    # Full audit
    report = run_all_detectors(contract)
    report.gas_issues = analyze_gas(source)

    if args.command == "fix":
        # Simplified fix: generate report with recommendations
        print("🔧 MantleGuard Fix Mode")
        print()
        print(f"Audited: {contract.name}")
        print(f"Issues found: {report.total_issues}")
        print()
        print("Recommendations:")
        for v in report.vulnerabilities:
            print(f"  • {v.title}")
            for rec in v.recommendation.split('\n')[:2]:
                print(f"    {rec}")
        print(f"\nManual fix needed — see report for details.")
        return

    # Audit output
    print_report(report, contract.name, format="json" if args.json else "text")

    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            if args.json:
                json.dump(report, f, indent=2)
            else:
                f.write(str(report))
        print(f"📄 Report saved to {args.output}")


def _cmd_init():
    """Создать демо-контракт с уязвимостями."""
    src = Path(__file__).parent.parent / "contracts" / "contracts" / "VulnerableWallet.sol"
    if src.exists():
        content = src.read_text(encoding="utf-8")
        output = "VulnerableWallet.sol"
        with open(output, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"✅ Created {output} — contains 8+ vulnerability types")
        print(f"   Run: mantleguard audit {output}")
    else:
        print("❌ Template not found")


if __name__ == "__main__":
    main()
