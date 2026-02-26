"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface GrantedPassProps {
  redirectUrl?: string;
}

/**
 * Pass granted display - shown when user gains entry
 */
export function GrantedPass({ redirectUrl = "/library" }: GrantedPassProps) {
  const router = useRouter();

  const handleEnter = () => {
    router.push(redirectUrl);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="text-center space-y-8"
    >
      {/* Pass indicator */}
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-block px-6 py-3 bg-ink text-paper font-mono text-sm uppercase tracking-wider rounded-lg"
        >
          Pass Granted
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="font-mono text-lg text-fog"
        >
          PASS // 157 // ACTIVE
        </motion.p>
      </div>

      {/* Enter button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        onClick={handleEnter}
        className="w-full max-w-xs mx-auto py-4 bg-ink text-paper font-mono uppercase tracking-wider rounded-lg hover:bg-ink/90 focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 transition-colors"
      >
        Cross the Threshold
      </motion.button>

      {/* 157 message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="font-mono text-xs text-fog/70"
      >
        Step 7: Enter with intent. Observe first. Then interact.
      </motion.p>
    </motion.div>
  );
}
