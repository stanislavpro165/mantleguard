"use client";

export default function LoadingState() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 48,
        gap: 20,
      }}
    >
      {/* Animated scanning */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          border: "2px solid rgba(0,212,170,0.1)",
          borderTop: "2px solid var(--color-mantle)",
          animation: "spin 1s linear infinite",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
            stroke="var(--color-mantle)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ opacity: 0.6 }}/>
        </svg>
      </div>

      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text)", marginBottom: 4 }}>
          Analyzing Contract
        </div>
        <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
          Running 11 security detectors...
        </div>
      </div>

      {/* Detector progress */}
      <div
        style={{
          display: "flex",
          gap: 6,
          maxWidth: 300,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {["Parser", "Reentrancy", "Access", "Overflow", "Tx Origin", "Timestamp",
          "Gas Griefing", "Delegatecall", "Selfdestruct", "Shadow", "Unused Return"].map((name) => (
          <span
            key={name}
            style={{
              fontSize: 10,
              padding: "3px 8px",
              borderRadius: "var(--radius-sm)",
              background: "rgba(0,212,170,0.06)",
              border: "1px solid rgba(0,212,170,0.1)",
              color: "var(--color-mantle)",
              fontWeight: 500,
            }}
          >
            {name}
          </span>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `@keyframes spin { to { transform: rotate(360deg); } }`
      }} />
    </div>
  );
}
