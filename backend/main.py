"""MantleGuard API — backend сервис для анализа смарт-контрактов."""

import json
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from analyzer.parser import parse_contract
from analyzer.detectors import run_all_detectors
from analyzer.gas_optimizer import analyze_gas
from analyzer.ai_analyzer import AIAnalyzer
from analyzer.models.report import AnalysisReport, Vulnerability, Severity

app = FastAPI(
    title="MantleGuard API",
    description="AI Security Agent для смарт-контрактов на Mantle",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AuditRequest(BaseModel):
    source: str
    contract_name: str = ""


class AuditResponse(BaseModel):
    contract_name: str
    source_length: int
    vulnerabilities: list
    gas_issues: list
    severity_summary: dict
    total_issues: int
    score: int
    detectors_run: int
    ai_analysis: str | None = None


@app.get("/health")
async def health():
    return {"status": "ok", "service": "MantleGuard", "version": "0.1.0"}


@app.post("/audit", response_model=AuditResponse)
async def audit_contract(req: AuditRequest):
    if not req.source or len(req.source) < 10:
        raise HTTPException(
            status_code=400,
            detail="Contract source code is too short or empty"
        )

    # 1. Парсинг
    contract = parse_contract(req.source)

    # 2. Запуск всех детекторов
    report = run_all_detectors(contract)

    # 3. Gas-анализ
    report.gas_issues = analyze_gas(req.source)

    # 4. AI-анализ (опционально)
    ai_result = None
    if os.getenv("OPENAI_API_KEY") or os.getenv("DEEPSEEK_API_KEY"):
        ai = AIAnalyzer()
        ai_result = ai.enhance_report(req.source, report)

    # 5. Ответ
    return AuditResponse(
        contract_name=contract.name or req.contract_name or "Unknown",
        source_length=len(req.source),
        vulnerabilities=[
            {
                "type": v.type.value,
                "severity": v.severity.value,
                "title": v.title,
                "description": v.description,
                "line_start": v.line_start,
                "line_end": v.line_end,
                "code_snippet": v.code_snippet,
                "recommendation": v.recommendation,
                "swc_id": v.swc_id,
            }
            for v in report.vulnerabilities
        ],
        gas_issues=[
            {
                "title": g.title,
                "description": g.description,
                "line_start": g.line_start,
                "line_end": g.line_end,
                "code_snippet": g.code_snippet,
                "estimated_saving": g.estimated_saving,
                "recommendation": g.recommendation,
            }
            for g in report.gas_issues
        ],
        severity_summary=report.severity_count,
        total_issues=report.total_issues,
        score=report.score,
        detectors_run=report.detectors_run,
        ai_analysis=ai_result,
    )


@app.post("/audit/quick")
async def quick_audit(req: AuditRequest):
    """Быстрый аудит без AI — для CLI и CI/CD."""
    contract = parse_contract(req.source)
    report = run_all_detectors(contract)
    report.gas_issues = analyze_gas(req.source)

    return {
        "contract": contract.name or req.contract_name,
        "score": report.score,
        "issues": report.total_issues,
        "severity": report.severity_count,
        "vulnerabilities": [
            {
                "type": v.type.value,
                "severity": v.severity.value,
                "title": v.title,
                "line": v.line_start,
            }
            for v in report.vulnerabilities
        ],
        "gas_issues": len(report.gas_issues),
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
