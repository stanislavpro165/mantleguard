"use client";

import { useState } from "react";
import type { GasIssue } from "@/lib/api";

export default function GasCard({ g }: { g: GasIssue }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="animate-fade"
      style={{
        borderRadius: "var(--radius-md)",
        border: "1px solid rgba(30,144,255,0.12)",
        background: "var(--color-bg-card)",
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          color: "var(--color-text)",
          fontSize: 13,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
          <path d="M4 18V6a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2z" stroke="#1e90ff" strokeWidth="1.5"/>
          <path d="M16 9h2a2 2 0 012 2v2a2 2 0 01-2 2h-2" stroke="#1e90ff" strokeWidth="1.5"/>
          <path d="M10 4v2M12 4v2" stroke="#1e90ff" strokeWidth="1" strokeLinecap="round"/>
        </svg>
        <span style={{ flex: 1, fontWeight: 500 }}>{g.title}</span>
        <span
          style={{
            fontSize: 10,
            padding: "2px 6px",
            borderRadius: "var(--radius-sm)",
            background: "var(--color-gas-bg)",
            color: "var(--color-gas)",
            fontWeight: 600,
            fontFamily: "var(--font-mono)",
          }}
        >
          {g.estimated_saving}
        </span>
        <span style={{ fontSize: 11, color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
          L:{g.line_start}
        </span>
        <svg
          width="14" height="14" viewBox="0 0 14 14" fill="none"
          style={{
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            flexShrink: 0,
          }}
        >
          <path d="M3 5L7 9L11 5" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {open && (
        <div
          style={{
            borderTop: "1px solid rgba(30,144,255,0.08)",
            padding: "10px 14px 14px",
            fontSize: 12,
            lineHeight: 1.7,
            color: "var(--color-text-secondary)",
          }}
        >
          <p style={{ marginBottom: 8 }}>{g.description}</p>
          <div
            style={{
              background: "var(--color-gas-bg)",
              borderLeft: "2px solid var(--color-gas)",
              padding: "8px 10px",
              borderRadius: "var(--radius-sm)",
              fontSize: 11,
              lineHeight: 1.7,
              color: "var(--color-gas)",
            }}
          >
            {g.recommendation.split("\n").map((line, i) => (
              <div key={i} style={{ color: "var(--color-text-secondary)" }}>{line}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
