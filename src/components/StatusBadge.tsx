interface StatusBadgeProps {
  status: "ACTIVE" | "QUEUED" | "EXPIRED" | "EXITED" | string;
  size?: "sm" | "md";
}

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-ink text-paper",
  QUEUED: "bg-hair text-ink border border-ink",
  EXPIRED: "bg-fog/20 text-fog",
  EXITED: "bg-fog/20 text-fog",
};

/**
 * Status indicator badge
 */
export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const style = statusStyles[status] || statusStyles.EXPIRED;
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center font-mono uppercase tracking-wide rounded-full ${style} ${sizeClass}`}
    >
      {status}
    </span>
  );
}
