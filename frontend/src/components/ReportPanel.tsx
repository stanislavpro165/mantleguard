"use client";

import { useState, useMemo } from "react";
import type { AuditResult } from "@/lib/api";
import RiskGauge from "@/components/RiskGauge";
import VulnerabilityCard from "@/components/VulnerabilityCard";
import GasCard from "@/components/GasCard";

interface ReportPanelProps {
  result: AuditResult;
}

type Tab = "vulnerabilities" | "gas" | "ai";

export default function ReportPanel({ result }: ReportPanelProps) {
  const [tab, setTab] = useState<Tab>("vulnerabilities");

  const sortedVulns = useMemo(
    () =>
      [...(result.vulnerabilities || [])].sort((a, b) => {
        const order: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, GAS: 4, INFO: 5 };
        return (order[a.severity] ?? 99) - (order[b.severity] ?? 99);
      }),
    [result.vulnerabilities]
  );

  const hasAi = !!result.ai_analysis;
  const vulnCount = result.vulnerabilities?.length || 0;
  const gasCount = result.gas_issues?.length || 0;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Risk Gauge */}
      <RiskGauge score={result.score} />

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 4,
          padding: "0 16px",
          borderBottom: "1px solid var(--color-border)",
          flexShrink: 0,
        }}
      >
        {[
          { id: "vulnerabilities" as Tab, label: "Vulnerabilities", count: vulnCount },
          { id: "gas" as Tab, label: "Gas Opt.", count: gasCount },
          ...(hasAi ? [{ id: "ai" as Tab, label: "AI Analysis", count: 0 }] : []),
        ].map((t) => {
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "8px 14px",
                fontSize: 12,
                fontWeight: 600,
                color: isActive ? "var(--color-mantle)" : "var(--color-text-muted)",
                background: "transparent",
                border: "none",
                borderBottom: isActive ? "2px solid var(--color-mantle)" : "2px solid transparent",
                cursor: "pointer",
                transition: "color 0.2s, border-color 0.2s",
                fontFamily: "var(--font-sans)",
                whiteSpace: "nowrap",
              }}
            >
              {t.label}
              {t.count > 0 && (
                <span
                  style={{
                    marginLeft: 6,
                    padding: "1px 6px",
                    borderRadius: 10,
                    fontSize: 10,
                    background: isActive ? "var(--color-mantle-glow)" : "rgba(255,255,255,0.05)",
                    color: isActive ? "var(--color-mantle)" : "var(--color-text-muted)",
                    fontWeight: 700,
                  }}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Meta */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 10,
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-mono)",
            paddingRight: 4,
          }}
        >
          <span>{result.detectors_run} detectors</span>
          <span>·</span>
          <span>{(result.source_length / 1024).toFixed(1)}kb</span>
        </div>
      </div>

      {/* Tab Content */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {/* Vulnerabilities */}
        {tab === "vulnerabilities" &&
          (sortedVulns.length === 0 ? (
            <div style={{ textAlign: "center", padding: 32, color: "var(--color-text-muted)", fontSize: 13 }}>
              ✅ No vulnerabilities detected
            </div>
          ) : (
            sortedVulns.map((v, i) => <VulnerabilityCard key={i} v={v} />)
          ))}

        {/* Gas */}
        {tab === "gas" &&
          (result.gas_issues?.length === 0 ? (
            <div style={{ textAlign: "center", padding: 32, color: "var(--color-text-muted)", fontSize: 13 }}>
              ⛽ No gas optimizations found
            </div>
          ) : (
            result.gas_issues?.map((g, i) => <GasCard key={i} g={g} />)
          ))}

        {/* AI Analysis */}
        {tab === "ai" && hasAi && (
          <pre
            style={{
              padding: 16,
              borderRadius: "var(--radius-md)",
              background: "var(--color-bg-card)",
              border: "1px solid var(--color-border)",
              fontSize: 12,
              lineHeight: 1.7,
              color: "var(--color-text-secondary)",
              fontFamily: "var(--font-mono)",
              whiteSpace: "pre-wrap",
              overflow: "auto",
            }}
          >
            {result.ai_analysis}
          </pre>
        )}
      </div>
    </div>
  );
}
