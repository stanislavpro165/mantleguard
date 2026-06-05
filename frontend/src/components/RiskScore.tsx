"use client";

import type { AuditResult } from "@/types";

function getScoreColor(score: number): string {
  if (score >= 70) return "var(--danger)";
  if (score >= 40) return "var(--warning)";
  return "var(--info)";
}

function getScoreLabel(score: number): string {
  if (score >= 70) return "CRITICAL";
  if (score >= 40) return "WARNING";
  return "SAFE";
}

const severityColors: Record<string, string> = {
  CRITICAL: "#ff4757",
  HIGH: "#ff6b81",
  MEDIUM: "#ffa502",
  LOW: "#2ed573",
  GAS: "#1e90ff",
  INFO: "#8e8ea0",
};

export default function RiskScore({ result }: { result: AuditResult }) {
  const sc = result.score;
  const color = getScoreColor(sc);
  const label = getScoreLabel(sc);
  const sev = result.severity_summary || {};

  return (
    <div style={{
      padding: "16px 20px",
      borderBottom: "1px solid var(--border)",
      background: "var(--bg-secondary)",
    }}>
      <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
        {/* Score Circle */}
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: `conic-gradient(${color} ${sc}%, transparent ${sc}%)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative", flexShrink: 0,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "var(--bg-secondary)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1 }}>
              {sc}
            </span>
            <span style={{ fontSize: 9, color: "var(--text-secondary)", letterSpacing: "0.5px" }}>
              RISK
            </span>
          </div>
        </div>

        {/* Summary */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color, marginBottom: 8 }}>
            {label} · {result.total_issues} issue{result.total_issues !== 1 ? "s" : ""} found
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {["CRITICAL", "HIGH", "MEDIUM", "LOW", "GAS"].map(s => {
              const count = sev[s] || 0;
              if (count === 0) return null;
              return (
                <div key={s} style={{
                  display: "flex", alignItems: "center", gap: 4,
                  fontSize: 12,
                }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: severityColors[s] || "#666",
                    display: "inline-block",
                  }} />
                  <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                    {count}
                  </span>
                  <span style={{ color: "var(--text-secondary)" }}>{s}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Meta */}
        <div style={{
          textAlign: "right", fontSize: 11, color: "var(--text-secondary)",
          lineHeight: 1.8, flexShrink: 0,
        }}>
          <div>Contract: <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
            {result.contract_name}
          </span></div>
          <div>Detectors: {result.detectors_run}</div>
          <div>Source: {(result.source_length / 1024).toFixed(1)} KB</div>
        </div>
      </div>
    </div>
  );
}
