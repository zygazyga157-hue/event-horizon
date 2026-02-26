interface OccupancyBadgeProps {
  activeCount: number;
  capacity: number;
}

/**
 * Live occupancy count badge
 */
export function OccupancyBadge({ activeCount, capacity }: OccupancyBadgeProps) {
  const isFull = activeCount >= capacity;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-sm ${
        isFull ? "bg-ink text-paper" : "bg-hair text-ink"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          isFull ? "bg-paper animate-pulse-slow" : "bg-ink"
        }`}
      />
      <span>
        {activeCount} / {capacity}
      </span>
    </div>
  );
}
