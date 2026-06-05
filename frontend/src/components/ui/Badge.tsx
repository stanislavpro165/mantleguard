interface BadgeProps {
  variant?: "danger" | "warning" | "info" | "gas" | "neutral";
  children: React.ReactNode;
  className?: string;
}

const styles: Record<string, React.CSSProperties> = {
  danger: { background: "var(--color-danger-bg)", color: "var(--color-danger)", border: "1px solid rgba(255,71,87,0.2)" },
  warning: { background: "var(--color-warning-bg)", color: "var(--color-warning)", border: "1px solid rgba(255,165,2,0.2)" },
  info: { background: "var(--color-info-bg)", color: "var(--color-info)", border: "1px solid rgba(46,213,115,0.2)" },
  gas: { background: "var(--color-gas-bg)", color: "var(--color-gas)", border: "1px solid rgba(30,144,255,0.2)" },
  neutral: { background: "rgba(255,255,255,0.04)", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)" },
};

export default function Badge({ variant = "neutral", children, className = "" }: BadgeProps) {
  return (
    <span
      className={className}
      style={{
        ...styles[variant],
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 8px",
        borderRadius: "var(--radius-sm)",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.3px",
        fontFamily: "var(--font-sans)",
      }}
    >
      {children}
    </span>
  );
}
