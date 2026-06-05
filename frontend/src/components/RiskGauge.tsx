"use client";

interface RiskGaugeProps {
  score: number;
}

function getScoreColor(score: number): string {
  if (score >= 70) return "var(--color-danger)";
  if (score >= 40) return "var(--color-warning)";
  return "var(--color-info)";
}

function getScoreLabel(score: number): string {
  if (score >= 70) return "CRITICAL";
  if (score >= 40) return "WARNING";
  return "SAFE";
}

function getScoreBg(score: number): string {
  if (score >= 70) return "rgba(255,71,87,0.08)";
  if (score >= 40) return "rgba(255,165,2,0.08)";
  return "rgba(46,213,115,0.08)";
}

export default function RiskGauge({ score }: RiskGaugeProps) {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const bg = getScoreBg(score);

  // SVG donut params
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: "16px 20px",
        borderRadius: "var(--radius-lg)",
        background: bg,
        border: `1px solid ${color}20`,
        margin: "0 16px 12px",
      }}
    >
      {/* SVG Gauge */}
      <div style={{ position: "relative", width: 88, height: 88, flexShrink: 0 }}>
        <svg width="88" height="88" viewBox="0 0 88 88">
          {/* Background ring */}
          <circle
            cx="44" cy="44" r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="6"
          />
          {/* Score ring */}
          <circle
            cx="44" cy="44" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 44 44)"
            style={{
              transition: "stroke-dashoffset 1s ease-out, stroke 0.3s",
              filter: `drop-shadow(0 0 8px ${color}40)`,
            }}
          />
        </svg>
        {/* Center text */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: 8, color: "var(--color-text-secondary)", letterSpacing: "1px", marginTop: 1 }}>
            RISK
          </span>
        </div>
      </div>

      {/* Text info */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 6, letterSpacing: "0.3px" }}>
          {label} RISK LEVEL
        </div>
        <div style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
          {score >= 70
            ? "Critical vulnerabilities detected. Immediate action required before deployment."
            : score >= 40
            ? "Moderate security concerns. Review and patch before mainnet."
            : "No critical issues found. Contract appears secure."}
        </div>
      </div>
    </div>
  );
}
