"use client";

export default function EmptyState({ onLoadDemo }: { onLoadDemo: () => void }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 48,
        textAlign: "center",
      }}
    >
      {/* Animated shield icon */}
      <div style={{ position: "relative", marginBottom: 24 }}>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="38" stroke="rgba(0,212,170,0.08)" strokeWidth="1" fill="rgba(0,212,170,0.02)"/>
          <path d="M40 18L24 26v12c0 12 6.4 23.2 16 28 9.6-4.8 16-16 16-28V26L40 18z"
            stroke="rgba(0,212,170,0.3)" strokeWidth="2" fill="rgba(0,212,170,0.04)"/>
          <path d="M33 40l5 5 9-9" stroke="var(--color-mantle)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ filter: "drop-shadow(0 0 6px rgba(0,212,170,0.5))" }}/>
        </svg>
      </div>

      <h2
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: "var(--color-text)",
          marginBottom: 8,
          letterSpacing: "-0.3px",
        }}
      >
        Ready to Audit
      </h2>
      <p
        style={{
          fontSize: 13,
          color: "var(--color-text-secondary)",
          maxWidth: 340,
          lineHeight: 1.7,
          marginBottom: 24,
        }}
      >
        Paste your Solidity smart contract in the editor, then click{" "}
        <span style={{ color: "var(--color-mantle)", fontWeight: 600 }}>Run Audit</span>{" "}
        to detect vulnerabilities and gas optimizations for Mantle Network.
      </p>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onLoadDemo}
          style={{
            padding: "10px 20px",
            borderRadius: "var(--radius-md)",
            background: "var(--color-mantle-glow)",
            border: "1px solid rgba(0,212,170,0.2)",
            color: "var(--color-mantle)",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            transition: "background 0.2s",
          }}
        >
          Load Demo Contract
        </button>
      </div>

      {/* Features grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginTop: 32,
          maxWidth: 480,
        }}
      >
        {[
          { icon: "🔍", title: "11 Detectors", desc: "Static analysis engine" },
          { icon: "⛽", title: "Gas Optimizer", desc: "Mantle L2 savings" },
          { icon: "🤖", title: "AI Analysis", desc: "Deep vulnerability scan" },
        ].map((item) => (
          <div
            key={item.title}
            style={{
              padding: "12px 8px",
              borderRadius: "var(--radius-md)",
              background: "var(--color-bg-card)",
              border: "1px solid var(--color-border)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 20, marginBottom: 4 }}>{item.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text)", marginBottom: 2 }}>
              {item.title}
            </div>
            <div style={{ fontSize: 10, color: "var(--color-text-muted)" }}>{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
