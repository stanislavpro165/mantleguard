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
  severity_count: Record<string, number>;
  total_issues: number;
  score: number;
  detectors_run: number;
  ai_analysis: string | null;
}
