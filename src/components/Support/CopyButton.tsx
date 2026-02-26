"use client";

import { useState } from "react";

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // fallback: do nothing
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className="rounded-full border border-ink/30 bg-white px-3 py-1 text-xs font-mono text-ink hover:bg-ink hover:text-paper transition"
      aria-label="Copy address"
    >
      {copied ? "COPIED" : "COPY"}
    </button>
  );
}
