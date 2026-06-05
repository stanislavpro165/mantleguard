"""AI-анализатор. Дополняет AST-анализ LLM-глубиной."""

import os
import json
from typing import Optional
from .models.report import AnalysisReport


class AIAnalyzer:
    """Углублённый AI-анализ через LLM."""

    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY") or os.getenv("DEEPSEEK_API_KEY")
        self.provider = "deepseek" if os.getenv("DEEPSEEK_API_KEY") else "openai"

    def enhance_report(
        self, source: str, report: AnalysisReport
    ) -> Optional[str]:
        """Дополнить отчёт AI-советами."""
        if not self.api_key:
            return None

        try:
            if self.provider == "deepseek":
                return self._call_deepseek(source, report)
            return self._call_openai(source, report)
        except Exception as e:
            return f"AI analysis unavailable: {e}"

    def _build_prompt(self, source: str, report: AnalysisReport) -> str:
        findings = []
        for v in report.vulnerabilities[:5]:  # топ-5
            findings.append(
                f"- [{v.severity.value}] {v.title} (line {v.line_start})"
            )

        return f"""Analyze this Solidity smart contract for security issues.

CONTRACT:
```solidity
{source[:3000]}
```

DETECTED ISSUES:
{chr(10).join(findings) if findings else "None detected by static analysis"}

TASK:
1. Identify any logical flaws not caught by static analysis
2. Rate the overall security posture (0-100)
3. Suggest the top 3 fixes that matter most
4. Identify any Mantle L2-specific optimizations

Respond in JSON format:
{{"security_score": 0-100, "critical_flaws": [...], "recommendations": [...], "l2_optimizations": [...]}}"""

    def _call_openai(self, source: str, report: AnalysisReport) -> str:
        import openai
        client = openai.OpenAI(api_key=self.api_key)
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a Solidity security expert."},
                {"role": "user", "content": self._build_prompt(source, report)},
            ],
            temperature=0.1,
            max_tokens=1000,
        )
        return resp.choices[0].message.content

    def _call_deepseek(self, source: str, report: AnalysisReport) -> str:
        import openai
        client = openai.OpenAI(
            api_key=self.api_key,
            base_url="https://api.deepseek.com",
        )
        resp = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "You are a Solidity security expert."},
                {"role": "user", "content": self._build_prompt(source, report)},
            ],
            temperature=0.1,
            max_tokens=1000,
        )
        return resp.choices[0].message.content
