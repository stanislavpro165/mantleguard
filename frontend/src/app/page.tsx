"use client";

import { useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import Header from "@/components/Header";
import ReportPanel from "@/components/ReportPanel";
import EmptyState from "@/components/EmptyState";
import LoadingState from "@/components/LoadingState";
import { auditContract, type AuditResult } from "@/lib/api";

const DEFAULT_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

contract HelloMantle {
    string public greeting;
    address public owner;

    constructor() {
        greeting = "Hello, Mantle!";
        owner = msg.sender;
    }

    function setGreeting(string memory _greeting) public {
        greeting = _greeting;
    }
}
`;

export default function Home() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleRunAudit = useCallback(async () => {
    if (!code?.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await auditContract(code);
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }, [code]);

  const handleLoadDemo = useCallback(async () => {
    try {
      const res = await fetch("/demo.sol");
      const text = await res.text();
      setCode(text);
      setResult(null);
    } catch {
      // fallback
    }
  }, []);

  const handleClear = useCallback(() => {
    setCode(DEFAULT_CODE);
    setResult(null);
    setError("");
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--color-bg)",
      }}
    >
      <Header />

      {/* Main split view */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* ─── Editor Panel ─── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            borderRight: "1px solid var(--color-border)",
            minWidth: 0,
          }}
        >
          {/* Toolbar */}
          <div
            style={{
              height: 44,
              padding: "0 12px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              borderBottom: "1px solid var(--color-border)",
              background: "var(--color-bg-elevated)",
              flexShrink: 0,
            }}
          >
            {/* Run Button */}
            <button
              onClick={handleRunAudit}
              disabled={loading}
              style={{
                padding: "6px 16px",
                borderRadius: "var(--radius-md)",
                background: loading
                  ? "var(--color-mantle-dim)"
                  : "var(--color-mantle)",
                color: "#000",
                border: "none",
                fontWeight: 700,
                fontSize: 12,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "opacity 0.2s",
              }}
            >
              {loading ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 1s linear infinite" }}>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round"/>
                  </svg>
                  Scanning
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M5 3l14 9-14 9V3z" fill="currentColor"/>
                  </svg>
                  Run Audit
                </>
              )}
            </button>

            <button
              onClick={handleLoadDemo}
              style={{
                padding: "6px 12px",
                borderRadius: "var(--radius-md)",
                background: "transparent",
                color: "var(--color-text-secondary)",
                border: "1px solid var(--color-border)",
                fontWeight: 500,
                fontSize: 12,
                cursor: "pointer",
                transition: "border-color 0.2s, color 0.2s",
              }}
            >
              Demo
            </button>
            <button
              onClick={handleClear}
              style={{
                padding: "6px 12px",
                borderRadius: "var(--radius-md)",
                background: "transparent",
                color: "var(--color-text-secondary)",
                border: "1px solid var(--color-border)",
                fontWeight: 500,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Reset
            </button>

            {/* File info */}
            <div style={{ flex: 1 }} />
            <span
              style={{
                fontSize: 10,
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {code ? `${(code.length / 1024).toFixed(1)}kb` : ""}
              {result ? ` · ${result.contract_name}` : ""}
            </span>
          </div>

          {/* Editor */}
          <div style={{ flex: 1, minHeight: 0 }}>
            <Editor
              height="100%"
              defaultLanguage="sol"
              language="sol"
              theme="vs-dark"
              value={code}
              onChange={(v) => {
                setCode(v || "");
                setResult(null);
              }}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                lineNumbers: "on",
                lineNumbersMinChars: 3,
                scrollBeyondLastLine: false,
                padding: { top: 12 },
                automaticLayout: true,
                bracketPairColorization: { enabled: true },
                renderLineHighlight: "all",
                cursorBlinking: "smooth",
                smoothScrolling: true,
                folding: true,
                foldingHighlight: true,
                guides: { indentation: true, bracketPairs: true },
              }}
            />
          </div>
        </div>

        {/* ─── Report Panel ─── */}
        <div
          style={{
            width: "42%",
            minWidth: 380,
            display: "flex",
            flexDirection: "column",
            background: "var(--color-bg-deep)",
            position: "relative",
          }}
        >
          {/* Background grid */}
          <div
            className="bg-grid"
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.5,
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Error Banner */}
            {error && (
              <div
                style={{
                  margin: "12px 16px 0",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-danger-bg)",
                  border: "1px solid rgba(255,71,87,0.2)",
                  color: "var(--color-danger)",
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexShrink: 0,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M12 8v4M12 16h0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                {error}
              </div>
            )}

            {/* Content */}
            {loading ? (
              <LoadingState />
            ) : result ? (
              <ReportPanel result={result} />
            ) : (
              <EmptyState onLoadDemo={handleLoadDemo} />
            )}
          </div>
        </div>
      </div>

      {/* Global keyframe for spinner */}
      <style dangerouslySetInnerHTML={{
        __html: `@keyframes spin { to { transform: rotate(360deg); } }`
      }} />
    </div>
  );
}
