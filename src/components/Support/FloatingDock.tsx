"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { SupportPanel } from "./SupportPanel";

type Props = {
  paypalDonateUrl: string;
  btcAddress: string;
  bchAddress?: string;
};

export function FloatingDock({ paypalDonateUrl, btcAddress, bchAddress }: Props) {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(false);
  const [open, setOpen] = useState(false);

  // Show dock after a bit of scroll to keep hero clean
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const pct = h > 0 ? y / h : 0;
      setShow(pct > 0.12); // ~12% down page
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dockAnim = {
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 10 },
    animate: reduce ? { opacity: 1 } : { opacity: 1, y: 0 },
    exit: reduce ? { opacity: 0 } : { opacity: 0, y: 10 },
  };

  return (
    <>
      <AnimatePresence>
        {show && !open && (
          <motion.div
            {...dockAnim}
            transition={{ duration: 0.18 }}
            className="fixed z-30 bottom-5 right-5 flex items-center gap-2"
          >
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-full border border-ink bg-ink text-paper px-4 py-2 text-xs font-mono hover:opacity-90 transition shadow-museum"
              aria-label="Open support options"
            >
              SUPPORT
            </button>

            <a
              href="/library/contact"
              className="rounded-full border border-hair bg-paper px-4 py-2 text-xs font-mono hover:bg-ink hover:text-paper transition shadow-museum"
              aria-label="Go to contact page"
            >
              CONTACT
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <SupportPanel
        open={open}
        onClose={() => setOpen(false)}
        paypalDonateUrl={paypalDonateUrl}
        btcAddress={btcAddress}
        bchAddress={bchAddress}
      />
    </>
  );
}
