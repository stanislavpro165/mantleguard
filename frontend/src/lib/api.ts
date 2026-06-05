const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Vulnerability {
  type: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "GAS" | "INFO";
  title: string;
  description: string;
  line_start: number;
  line_end: number;
  code_snippet: string;
  recommendation: string;
  swc_id: string | null;
}

export interface GasIssue {
  title: string;
  description: string;
  line_start: number;
  line_end: number;
  code_snippet: string;
  estimated_saving: string;
  recommendation: string;
}

export interface AuditResult {
  contract_name: string;
  source_length: number;
  vulnerabilities: Vulnerability[];
  gas_issues: GasIssue[];
  severity_summary: Record<string, number>;
  total_issues: number;
  score: number;
  detectors_run: number;
  ai_analysis: string | null;
}

export async function auditContract(
  source: string
): Promise<AuditResult> {
  const res = await fetch(`${API_BASE}/audit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source, contract_name: "" }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `API error: ${res.status}`);
  }

  return res.json();
}
