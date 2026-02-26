"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import { CopyButton } from "./CopyButton";

type Props = {
  open: boolean;
  onClose: () => void;
  paypalDonateUrl: string;
  btcAddress: string;
  bchAddress?: string;
};

export function SupportPanel({
  open,
  onClose,
  paypalDonateUrl,
  btcAddress,
  bchAddress,
}: Props) {
  const reduce = useReducedMotion();

  const overlay = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const panel = {
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.985 },
    animate: reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 },
    exit: reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.985 },
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* overlay */}
          <motion.div
            {...overlay}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* panel */}
          <motion.aside
            {...panel}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="fixed z-50 bottom-5 right-5 w-[min(420px,calc(100vw-2.5rem))] max-h-[calc(100vh-2.5rem)] overflow-y-auto rounded-2xl bg-paper shadow-museum-lg border border-ink/20"
            role="dialog"
            aria-modal="true"
            aria-label="Support panel"
          >
            {/* measurement frame corners */}
            <div className="relative rounded-2xl p-5">
              {["tl", "tr", "bl", "br"].map((p) => (
                <span
                  key={p}
                  className={[
                    "pointer-events-none absolute h-4 w-4",
                    p === "tl" && "left-0 top-0 border-l border-t border-ink",
                    p === "tr" && "right-0 top-0 border-r border-t border-ink",
                    p === "bl" && "left-0 bottom-0 border-l border-b border-ink",
                    p === "br" && "right-0 bottom-0 border-r border-b border-ink",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                />
              ))}

              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-mono text-xs text-ink/60">157 // SUPPORT CHANNELS</div>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight text-ink">SUPPORT THE CURATOR</h3>
                  <p className="mt-1 text-sm text-ink/70 leading-relaxed">
                    PayPal for fast support. Crypto for direct transfer.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-ink/30 bg-white px-3 py-1 text-xs font-mono text-ink hover:bg-ink hover:text-paper transition"
                  aria-label="Close support panel"
                >
                  CLOSE
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {/* PayPal */}
                <section className="rounded-2xl border border-ink/20 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-mono text-xs text-ink/60">PAYPAL</div>
                      <div className="mt-1 text-sm text-ink">One-time support</div>
                    </div>

                    <a
                      href={paypalDonateUrl || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className={`rounded-full px-4 py-2 text-xs font-mono transition border ${
                        paypalDonateUrl
                          ? "border-ink bg-ink text-paper hover:opacity-90"
                          : "border-ink/30 text-ink/50 cursor-not-allowed bg-white"
                      }`}
                      aria-disabled={!paypalDonateUrl}
                    >
                      DONATE
                    </a>
                  </div>
                  {!paypalDonateUrl && (
                    <p className="mt-2 text-xs text-ink/50">
                      Set <span className="font-mono">NEXT_PUBLIC_PAYPAL_DONATE_URL</span> to enable.
                    </p>
                  )}
                </section>

                {/* BTC */}
                <section className="rounded-2xl border border-ink/20 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-mono text-xs text-ink/60">BTC ADDRESS</div>
                      <div className="mt-2 break-all font-mono text-xs text-ink">{btcAddress || "BTC_ADDRESS_HERE"}</div>
                    </div>
                    <CopyButton value={btcAddress || ""} />
                  </div>

                  {btcAddress && (
                    <div className="mt-4 flex justify-center">
                      <QRCodeCanvas value={`bitcoin:${btcAddress}`} size={120} bgColor="#FFFFFF" fgColor="#0B0B0B" />
                    </div>
                  )}

                  {!btcAddress && (
                    <p className="mt-2 text-xs text-ink/50">
                      Set <span className="font-mono">NEXT_PUBLIC_BTC_ADDRESS</span> to enable.
                    </p>
                  )}
                </section>

                {/* Optional BCH */}
                {typeof bchAddress !== "undefined" && bchAddress && (
                  <section className="rounded-2xl border border-ink/20 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-mono text-xs text-ink/60">BCH ADDRESS</div>
                        <div className="mt-2 break-all font-mono text-xs text-ink">{bchAddress}</div>
                      </div>
                      <CopyButton value={bchAddress} />
                    </div>

                    <div className="mt-4 flex justify-center">
                      <QRCodeCanvas value={`bitcoincash:${bchAddress}`} size={120} bgColor="#FFFFFF" fgColor="#0B0B0B" />
                    </div>
                  </section>
                )}
              </div>

              <div className="mt-5 border-t border-ink/20 pt-4 flex items-center justify-between">
                <div className="font-mono text-xs text-ink/50">Do(C)</div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-ink/50">PROJECT ZYGA</span>
                  <span className="h-2 w-2 rounded-full bg-red-600" aria-hidden="true" />
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
