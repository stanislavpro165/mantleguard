"use client";

import { useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import AuditReport from "@/components/AuditReport";
import RiskScore from "@/components/RiskScore";
import type { AuditResult } from "@/types";

const DEFAULT_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

contract HelloMantle {
    string public greeting;

    constructor() {
        greeting = "Hello, Mantle!";
    }

    function setGreeting(string memory _greeting) public {
        greeting = _greeting;
    }
}
`;



export default function Home() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"editor" | "result">("editor");

  const runAudit = useCallback(async () => {
    const source = code.trim() || DEFAULT_CODE;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8000/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, contract_name: "" }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `API error: ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
      setActiveTab("result");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to analyze contract");
    } finally {
      setLoading(false);
    }
  }, [code]);

  const loadDemo = useCallback(async () => {
    try {
      const res = await fetch("/demo.sol");
      const text = await res.text();
      setCode(text);
    } catch {
      setCode(DEFAULT_CODE);
    }
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{
        padding: "16px 24px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "var(--bg-secondary)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 24 }}>🛡️</span>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--accent)", margin: 0 }}>
              MantleGuard
            </h1>
            <span style={{ fontSize: 11, color: "var(--text-secondary)", letterSpacing: "0.5px" }}>
              AI SECURITY AGENT
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{
            fontSize: 11, padding: "3px 8px",
            background: "rgba(0, 212, 170, 0.1)", color: "var(--accent)",
            borderRadius: 4, border: "1px solid rgba(0, 212, 170, 0.3)",
            letterSpacing: "0.3px"
          }}>
            MANTLE NETWORK
          </span>
        </div>
      </header>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Tab bar for mobile */}
        <div style={{
          display: "none",
          padding: "8px 16px", gap: 8,
          borderBottom: "1px solid var(--border)",
        }} className="tab-bar">
          <button onClick={() => setActiveTab("editor")}
            style={{
              padding: "8px 16px", borderRadius: 6,
              background: activeTab === "editor" ? "var(--accent)" : "transparent",
              color: activeTab === "editor" ? "#000" : "var(--text-secondary)",
              border: "1px solid var(--border)",
              fontWeight: 600, fontSize: 13, cursor: "pointer",
            }}>
            Editor
          </button>
          <button onClick={() => setActiveTab("result")}
            disabled={!result}
            style={{
              padding: "8px 16px", borderRadius: 6,
              background: activeTab === "result" ? "var(--accent)" : "transparent",
              color: activeTab === "result" ? "#000" : "var(--text-secondary)",
              border: "1px solid var(--border)",
              fontWeight: 600, fontSize: 13, cursor: "pointer",
              opacity: result ? 1 : 0.5,
            }}>
            Report
          </button>
        </div>

        {/* Editor Panel */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid var(--border)",
        }}>
          {/* Toolbar */}
          <div style={{
            padding: "8px 16px",
            display: "flex", gap: 8, alignItems: "center",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg-secondary)",
          }}>
            <button onClick={runAudit} disabled={loading}
              style={{
                padding: "8px 20px", borderRadius: 6,
                background: loading ? "var(--accent-dim)" : "var(--accent)",
                color: "#000", border: "none",
                fontWeight: 700, fontSize: 13, cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}>
              {loading ? "⟳ Analyzing..." : "▶ Run Audit"}
            </button>
            <button onClick={loadDemo}
              style={{
                padding: "8px 16px", borderRadius: 6,
                background: "transparent", color: "var(--text-secondary)",
                border: "1px solid var(--border)",
                fontWeight: 500, fontSize: 12, cursor: "pointer",
              }}>
              Load Demo
            </button>
            <button onClick={() => setCode("")}
              style={{
                padding: "8px 16px", borderRadius: 6,
                background: "transparent", color: "var(--text-secondary)",
                border: "1px solid var(--border)",
                fontWeight: 500, fontSize: 12, cursor: "pointer",
              }}>
              Clear
            </button>

            {result && (
              <span style={{
                marginLeft: "auto", fontSize: 11,
                color: "var(--text-secondary)",
              }}>
                {result.detectors_run} detectors · {result.total_issues} issues
              </span>
            )}
          </div>

          {/* Monaco Editor */}
          <div style={{ flex: 1, minHeight: 0 }}>
            <Editor
              height="100%"
              defaultLanguage="sol"
              language="sol"
              theme="vs-dark"
              value={code || DEFAULT_CODE}
              onChange={(v) => setCode(v || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', monospace",
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                padding: { top: 16 },
                automaticLayout: true,
                bracketPairColorization: { enabled: true },
              }}
            />
          </div>
        </div>

        {/* Report Panel */}
        <div style={{
          width: "45%", minWidth: 400, overflow: "auto",
          display: "flex", flexDirection: "column",
        }}>
          {error && (
            <div style={{
              padding: 16, margin: 16,
              background: "rgba(255, 71, 87, 0.1)",
              border: "1px solid var(--danger)",
              borderRadius: 8, color: "var(--danger)", fontSize: 13,
            }}>
              ❌ {error}
            </div>
          )}

          {loading && (
            <div style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
              flexDirection: "column", gap: 16, color: "var(--text-secondary)",
            }}>
              <div style={{ fontSize: 48, animation: "none" }}>🔍</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Analyzing contract...</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                Running {11} security detectors
              </div>
            </div>
          )}

          {!loading && !error && !result && (
            <div style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
              flexDirection: "column", gap: 16, color: "var(--text-secondary)", padding: 32,
              textAlign: "center",
            }}>
              <div style={{ fontSize: 48, opacity: 0.4 }}>🛡️</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>
                Paste a Solidity contract
              </div>
              <div style={{ fontSize: 13, maxWidth: 320, lineHeight: 1.6 }}>
                Drop your .sol file or paste code in the editor, then click{" "}
                <span style={{ color: "var(--accent)", fontWeight: 600 }}>Run Audit</span>
              </div>
              <button onClick={loadDemo}
                style={{
                  marginTop: 8, padding: "8px 20px", borderRadius: 6,
                  background: "transparent", color: "var(--accent)",
                  border: "1px solid var(--accent)",
                  fontWeight: 600, fontSize: 13, cursor: "pointer",
                }}>
                Try Demo Contract
              </button>
            </div>
          )}

          {!loading && result && (
            <>
              <RiskScore result={result} />
              <AuditReport result={result} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
