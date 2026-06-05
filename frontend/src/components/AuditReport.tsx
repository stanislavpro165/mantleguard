"use client";

import { useState } from "react";
import type { AuditResult, Vulnerability, GasIssue } from "@/types";

const severityColors: Record<string, string> = {
  CRITICAL: "#ff4757",
  HIGH: "#ff6b81",
  MEDIUM: "#ffa502",
  LOW: "#2ed573",
  GAS: "#1e90ff",
  INFO: "#8e8ea0",
};

function VulnCard({ v }: { v: Vulnerability }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{
      border: `1px solid ${severityColors[v.severity] || "#333"}40`,
      borderRadius: 8, overflow: "hidden",
      background: "var(--bg-card)",
    }}>
      <button onClick={() => setOpen(!open)}
        style={{
          width: "100%", padding: "12px 16px",
          display: "flex", alignItems: "center", gap: 12,
          background: "transparent", border: "none",
          cursor: "pointer", textAlign: "left", color: "var(--text-primary)",
          fontSize: 13,
        }}>
        <span style={{
          width: 8, height: 8, borderRadius: "50%",
          background: severityColors[v.severity] || "#666",
          flexShrink: 0,
        }} />
        <span style={{
          fontSize: 11, fontWeight: 700, color: severityColors[v.severity],
          flexShrink: 0, minWidth: 60,
        }}>
          {v.severity}
        </span>
        <span style={{ flex: 1, fontWeight: 500 }}>
          {v.title}
        </span>
        <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
          L{v.line_start}
        </span>
        <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
          {v.swc_id || ""}
        </span>
        <span style={{ color: "var(--text-secondary)", fontSize: 16 }}>
          {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <div style={{
          padding: "12px 16px 16px",
          borderTop: "1px solid var(--border)",
          fontSize: 13, lineHeight: 1.6, color: "var(--text-secondary)",
        }}>
          <div style={{ marginBottom: 12 }}>{v.description}</div>

          {v.code_snippet && (
            <pre style={{
              background: "rgba(0,0,0,0.3)", padding: "8px 12px",
              borderRadius: 6, fontSize: 12, overflow: "auto",
              border: "1px solid var(--border)", marginBottom: 12,
              fontFamily: "'JetBrains Mono', monospace",
              color: "var(--text-primary)",
            }}>
              {v.code_snippet}
            </pre>
          )}

          <div style={{
            background: "rgba(46, 213, 115, 0.08)",
            borderLeft: "3px solid var(--info)",
            padding: "8px 12px", borderRadius: 4,
            color: "var(--info)", fontSize: 12,
            lineHeight: 1.6,
          }}>
            <strong style={{ display: "block", marginBottom: 4 }}>Recommendation</strong>
            {v.recommendation.split("\n").map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function GasCard({ g }: { g: GasIssue }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{
      border: "1px solid #1e90ff40", borderRadius: 8, overflow: "hidden",
      background: "var(--bg-card)",
    }}>
      <button onClick={() => setOpen(!open)}
        style={{
          width: "100%", padding: "10px 16px",
          display: "flex", alignItems: "center", gap: 12,
          background: "transparent", border: "none",
          cursor: "pointer", textAlign: "left", color: "var(--text-primary)",
          fontSize: 13,
        }}>
        <span style={{ fontSize: 14 }}>⛽</span>
        <span style={{ flex: 1, fontWeight: 500 }}>{g.title}</span>
        <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
          L{g.line_start}
        </span>
        <span style={{
          fontSize: 11, padding: "2px 6px", borderRadius: 4,
          background: "rgba(30, 144, 255, 0.1)", color: "#1e90ff",
        }}>
          {g.estimated_saving}
        </span>
        <span style={{ color: "var(--text-secondary)", fontSize: 16 }}>
          {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <div style={{
          padding: "10px 16px 14px",
          borderTop: "1px solid var(--border)",
          fontSize: 12, lineHeight: 1.6, color: "var(--text-secondary)",
        }}>
          <div style={{ marginBottom: 8 }}>{g.description}</div>
          <div style={{
            background: "rgba(30, 144, 255, 0.08)",
            borderLeft: "3px solid #1e90ff",
            padding: "8px 12px", borderRadius: 4, fontSize: 12,
          }}>
            {g.recommendation.split("\n").map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AuditReport({ result }: { result: AuditResult }) {
  const vulns = result.vulnerabilities || [];
  const gas = result.gas_issues || [];

  // Sort vulns by severity
  const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, GAS: 4, INFO: 5 };
  vulns.sort((a, b) => (severityOrder[a.severity] ?? 99) - (severityOrder[b.severity] ?? 99));

  const [tab, setTab] = useState<"vulns" | "gas" | "ai">("vulns");

  return (
    <div style={{ padding: 16, overflow: "auto", flex: 1 }}>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16,
        borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
        <button onClick={() => setTab("vulns")}
          style={{
            padding: "6px 16px", borderRadius: 6,
            background: tab === "vulns" ? "var(--accent)" : "transparent",
            color: tab === "vulns" ? "#000" : "var(--text-secondary)",
            border: "none", fontWeight: 600, fontSize: 12, cursor: "pointer",
          }}>
          Vulnerabilities ({vulns.length})
        </button>
        <button onClick={() => setTab("gas")}
          style={{
            padding: "6px 16px", borderRadius: 6,
            background: tab === "gas" ? "var(--accent)" : "transparent",
            color: tab === "gas" ? "#000" : "var(--text-secondary)",
            border: "none", fontWeight: 600, fontSize: 12, cursor: "pointer",
          }}>
          Gas Optimizations ({gas.length})
        </button>
        {result.ai_analysis && (
          <button onClick={() => setTab("ai")}
            style={{
              padding: "6px 16px", borderRadius: 6,
              background: tab === "ai" ? "var(--accent)" : "transparent",
              color: tab === "ai" ? "#000" : "var(--text-secondary)",
              border: "none", fontWeight: 600, fontSize: 12, cursor: "pointer",
            }}>
            AI Analysis
          </button>
        )}
      </div>

      {/* Vulns */}
      {tab === "vulns" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {vulns.length === 0 ? (
            <div style={{
              textAlign: "center", padding: 32,
              color: "var(--text-secondary)", fontSize: 14,
            }}>
              ✅ No vulnerabilities detected
            </div>
          ) : (
            vulns.map((v, i) => <VulnCard key={i} v={v} />)
          )}
        </div>
      )}

      {/* Gas */}
      {tab === "gas" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {gas.length === 0 ? (
            <div style={{
              textAlign: "center", padding: 32,
              color: "var(--text-secondary)", fontSize: 14,
            }}>
              ⛽ No gas optimizations found
            </div>
          ) : (
            gas.map((g, i) => <GasCard key={i} g={g} />)
          )}
        </div>
      )}

      {/* AI */}
      {tab === "ai" && result.ai_analysis && (
        <div style={{
          padding: 16, borderRadius: 8,
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          fontSize: 13, lineHeight: 1.7, color: "var(--text-secondary)",
          whiteSpace: "pre-wrap",
        }}>
          {result.ai_analysis}
        </div>
      )}
    </div>
  );
}
