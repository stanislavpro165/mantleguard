"use client";

export default function Header() {
  return (
    <header
      style={{
        height: 56,
        padding: "0 24px",
        borderBottom: "1px solid var(--color-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "var(--color-bg-elevated)",
        flexShrink: 0,
        position: "relative",
        zIndex: 10,
      }}
    >
      {/* Left — Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Logo mark */}
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect x="2" y="2" width="24" height="24" rx="6" stroke="#00d4aa" strokeWidth="1.5" fill="rgba(0,212,170,0.08)"/>
          <path d="M8 14L12 18L20 10" stroke="#00d4aa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div>
          <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.3px" }}>
            <span className="gradient-text">Mantle</span>Guard
          </span>
        </div>
        <span
          style={{
            fontSize: 10,
            padding: "2px 8px",
            borderRadius: "var(--radius-sm)",
            background: "var(--color-mantle-glow)",
            color: "var(--color-mantle)",
            border: "1px solid rgba(0,212,170,0.2)",
            fontWeight: 600,
            letterSpacing: "0.5px",
          }}
        >
          AI AGENT
        </span>
      </div>

      {/* Center — Status */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 12,
          color: "var(--color-text-secondary)",
        }}
      >
        <span className="status-dot online" />
        <span>API Connected</span>
      </div>

      {/* Right — Mantle Badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <svg width="80" height="20" viewBox="0 0 200 50">
          <text x="0" y="32" fontSize="28" fontWeight="700" fill="#8888aa" letterSpacing="2">MANTLE</text>
          <text x="120" y="32" fontSize="16" fontWeight="400" fill="#555570" letterSpacing="1">dev</text>
        </svg>
      </div>
    </header>
  );
}
