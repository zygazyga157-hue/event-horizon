"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MeasureFrame, OccupancyBadge, CalibrationLine } from "@/components";
import {
  LedgerForm,
  LedgerFormData,
  QueueTicker,
  GrantedPass,
  HeartbeatClient,
  PromotionTransition,
} from "@/components/Gate";
import { useToast } from "@/components/Toast";
import { getErrorFromReason } from "@/lib/errors";

type GateState = "arrival" | "checkin" | "verifying" | "granted" | "waiting" | "promoting" | "passkey";

// Passkey state for admin flow
interface PasskeyState {
  email: string;
  maskedEmail: string;
}

// 157 Triad messages
const triadMessages = {
  arrival: [
    "Step 1: Name yourself.",
    "The ledger creates order.",
    "Identity is the first coordinate.",
  ],
  waiting: [
    "Step 5: Accept the drift.",
    "Capacity is a law; waiting is not denial.",
    "The corridor reshapes around load.",
  ],
  granted: [
    "Step 7: Enter with intent.",
    "Observe first. Then interact.",
    "Wisdom is bandwidth spent carefully.",
  ],
};

const globalMessages = [
  "157: Begin. Adapt. Understand.",
  "157: A door, a corridor, a chamber of insight.",
  "157: Independent motion, pragmatic method, quiet clarity.",
  "157: Initiation → Transition → Alignment.",
  "157: The ledger remembers. The system permits.",
];

function GatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const hasShownReasonToast = useRef(false);
  
  const [state, setState] = useState<GateState>("arrival");
  const [occupancy, setOccupancy] = useState({ activeCount: 0, capacity: 200, queueLength: 0 });
  const [queuePosition, setQueuePosition] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [passkeyState, setPasskeyState] = useState<PasskeyState | null>(null);
  const [passkeyInput, setPasskeyInput] = useState("");
  const [isVerifyingPasskey, setIsVerifyingPasskey] = useState(false);

  // Handle URL reason parameter and show appropriate toast
  useEffect(() => {
    if (hasShownReasonToast.current) return;
    
    const reason = searchParams.get("reason");
    const errorDef = getErrorFromReason(reason);
    
    if (errorDef) {
      hasShownReasonToast.current = true;
      
      showToast({
        type: errorDef.type,
        title: errorDef.title,
        message: errorDef.message,
        duration: 8000,
        action: errorDef.actionLabel
          ? {
              label: errorDef.actionLabel,
              onClick: () => {
                // Clear the reason from URL
                router.replace("/gate");
              },
            }
          : undefined,
      });
      
      // Clean up URL after showing toast
      const timeout = setTimeout(() => {
        router.replace("/gate");
      }, 500);
      
      return () => clearTimeout(timeout);
    }
  }, [searchParams, showToast, router]);

  // Fetch initial status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/gate/status");
        const data = await res.json();
        setOccupancy({
          activeCount: data.activeCount ?? 0,
          capacity: data.capacity ?? 200,
          queueLength: data.queueLength ?? 0,
        });

        // Check if user already has a session
        if (data.yourStatus === "ACTIVE") {
          setState("granted");
        } else if (data.yourStatus === "QUEUED") {
          setState("waiting");
          setQueuePosition(data.queuePosition ?? 1);
        }
      } catch {
        // Ignore fetch errors on initial load
      }
    };

    fetchStatus();
  }, []);

  // Rotate messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % globalMessages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCheckinStart = () => {
    setState("checkin");
  };

  const handleCheckinSubmit = async (formData: LedgerFormData) => {
    setState("verifying");
    setError(null);

    try {
      const res = await fetch("/api/gate/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          displayName: formData.displayName,
          email: formData.email || undefined,
          purpose: formData.purpose || undefined,
          consent: formData.consent,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Check-in failed");
        setState("checkin");
        return;
      }

      // Handle admin passkey flow
      if (data.status === "ADMIN_PASSKEY_REQUIRED") {
        setPasskeyState({
          email: formData.email,
          maskedEmail: data.email,
        });
        setState("passkey");
        showToast({
          type: "info",
          title: "Passkey Sent",
          message: `Check ${data.email} for your admin access code`,
          duration: 6000,
        });
        return;
      }

      setOccupancy({
        activeCount: data.activeCount,
        capacity: data.capacity,
        queueLength: data.queueLength ?? 0,
      });

      if (data.status === "ACTIVE") {
        setState("granted");
      } else if (data.status === "QUEUED") {
        setQueuePosition(data.queuePosition ?? 1);
        setState("waiting");
      }
    } catch {
      setError("Network error. Please try again.");
      setState("checkin");
    }
  };

  // Handle passkey verification
  const handlePasskeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passkeyState || passkeyInput.length !== 8) return;
    
    setIsVerifyingPasskey(true);
    setError(null);
    
    try {
      const res = await fetch("/api/gate/verify-passkey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: passkeyState.email,
          passkey: passkeyInput.toUpperCase(),
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Invalid passkey");
        setIsVerifyingPasskey(false);
        return;
      }
      
      // Admin access granted - redirect to admin dashboard
      showToast({
        type: "success",
        title: "Admin Access Granted",
        message: "Welcome back, Zyga",
        duration: 4000,
      });
      
      // Hard redirect to admin dashboard (ensures cookie is sent with new request)
      window.location.href = "/admin";
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsVerifyingPasskey(false);
    }
  };

  // Handle promotion from queue - show transition animation
  const handlePromoted = useCallback(() => {
    setState("promoting");
  }, []);

  // Complete promotion transition - go to granted state
  const handlePromotionComplete = useCallback(() => {
    setState("granted");
  }, []);

  const handleExpired = useCallback(() => {
    setState("arrival");
  }, []);

  // Handle queue position updates from heartbeat
  const handleQueuePositionChange = useCallback((position: number) => {
    setQueuePosition(position);
  }, []);

  // Handle occupancy updates
  const handleOccupancyChange = useCallback((data: { activeCount: number; capacity: number; queueLength?: number }) => {
    setOccupancy({
      activeCount: data.activeCount,
      capacity: data.capacity,
      queueLength: data.queueLength ?? 0,
    });
  }, []);

  const getTriadMessage = () => {
    const messages =
      state === "waiting" || state === "promoting"
        ? triadMessages.waiting
        : state === "granted"
        ? triadMessages.granted
        : triadMessages.arrival;
    return messages[messageIndex % messages.length];
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* Heartbeat client */}
      <HeartbeatClient
        enabled={state === "waiting" || state === "granted" || state === "promoting"}
        onOccupancyChange={handleOccupancyChange}
        onQueuePositionChange={handleQueuePositionChange}
        onPromoted={handlePromoted}
        onExpired={handleExpired}
        onStatusChange={(status) => {
          if (status === "ACTIVE" && state === "waiting") {
            // Promoted from queue - show transition
            setState("promoting");
          } else if (status === "ACTIVE") {
            setState("granted");
          }
          if (status === "EXPIRED" || status === "EXITED") setState("arrival");
        }}
      />

      {/* Top bar */}
      <header className="px-5 md:px-8 py-4 flex items-center justify-between border-b border-hair">
        <h1 className="font-mono text-sm uppercase tracking-wider text-ink">
          Event Horizon Library
        </h1>
        <OccupancyBadge
          activeCount={occupancy.activeCount}
          capacity={occupancy.capacity}
        />
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-5 md:px-8 py-10">
        <div className="w-full max-w-md">
          <MeasureFrame
            meta="GATE-157 / v1.0 / 2026-01-24"
            showMeta
            className="p-8 bg-paper shadow-museum rounded-2xl"
          >
            <AnimatePresence mode="wait">
              {/* ARRIVAL */}
              {state === "arrival" && (
                <motion.div
                  key="arrival"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8 text-center"
                >
                  <div className="space-y-4">
                    <h2 className="text-3xl font-medium tracking-tight text-ink">
                      THE GATE
                    </h2>
                    <p className="text-fog">
                      Every visitor signs the ledger.
                      <br />
                      Capacity is limited. Passage is granted by order.
                    </p>
                  </div>

                  <button
                    onClick={handleCheckinStart}
                    className="w-full py-4 bg-ink text-paper font-mono uppercase tracking-wider rounded-lg hover:bg-ink/90 focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 transition-colors"
                  >
                    Sign the Ledger
                  </button>
                </motion.div>
              )}

              {/* CHECK-IN */}
              {state === "checkin" && (
                <motion.div
                  key="checkin"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-medium tracking-tight text-ink">
                      Sign the Ledger
                    </h2>
                    <p className="text-sm text-fog">{getTriadMessage()}</p>
                  </div>

                  {error && (
                    <div className="p-3 bg-ink/5 border border-ink rounded-lg text-sm text-ink">
                      {error}
                    </div>
                  )}

                  <LedgerForm onSubmit={handleCheckinSubmit} />
                </motion.div>
              )}

              {/* VERIFYING */}
              {state === "verifying" && (
                <motion.div
                  key="verifying"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 space-y-8 text-center"
                >
                  <p className="font-mono text-sm uppercase tracking-wider text-fog">
                    Calibrating pass...
                  </p>
                  <CalibrationLine isAnimating />
                </motion.div>
              )}

              {/* PASSKEY - Admin verification */}
              {state === "passkey" && passkeyState && (
                <motion.div
                  key="passkey"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-medium tracking-tight text-ink">
                      Admin Verification
                    </h2>
                    <p className="text-sm text-fog">
                      Enter the 8-character passkey sent to {passkeyState.maskedEmail}
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 bg-ink/5 border border-ink rounded-lg text-sm text-ink">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handlePasskeySubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label
                        htmlFor="passkey"
                        className="block font-mono text-xs uppercase tracking-plaque text-fog"
                      >
                        Passkey
                      </label>
                      <input
                        type="text"
                        id="passkey"
                        value={passkeyInput}
                        onChange={(e) => setPasskeyInput(e.target.value.toUpperCase().slice(0, 8))}
                        placeholder="XXXX-XXXX"
                        maxLength={8}
                        disabled={isVerifyingPasskey}
                        autoFocus
                        autoComplete="off"
                        className="w-full px-4 py-4 bg-paper border border-hair rounded-lg font-mono text-2xl text-center tracking-widest text-ink placeholder:text-fog/30 focus:outline-none focus:ring-2 focus:ring-ink transition-colors uppercase"
                      />
                      <p className="text-xs text-fog text-center">
                        Passkey expires in 10 minutes
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setState("checkin");
                          setPasskeyState(null);
                          setPasskeyInput("");
                          setError(null);
                        }}
                        disabled={isVerifyingPasskey}
                        className="flex-1 py-4 bg-transparent border border-hair text-ink font-mono uppercase tracking-wider rounded-lg hover:bg-hair/20 focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 transition-colors disabled:opacity-50"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isVerifyingPasskey || passkeyInput.length !== 8}
                        className="flex-1 py-4 bg-ink text-paper font-mono uppercase tracking-wider rounded-lg hover:bg-ink/90 focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isVerifyingPasskey ? "Verifying..." : "Verify"}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* GRANTED */}
              {state === "granted" && (
                <motion.div
                  key="granted"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <GrantedPass />
                </motion.div>
              )}

              {/* WAITING */}
              {state === "waiting" && (
                <motion.div
                  key="waiting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <span className="inline-block px-4 py-2 bg-hair text-ink font-mono text-sm uppercase tracking-wider rounded-full">
                      At Capacity
                    </span>
                  </div>

                  <QueueTicker
                    position={queuePosition}
                    activeCount={occupancy.activeCount}
                    capacity={occupancy.capacity}
                    queueLength={occupancy.queueLength}
                  />

                  <button
                    disabled
                    className="w-full py-4 bg-hair text-ink font-mono uppercase tracking-wider rounded-lg cursor-not-allowed opacity-60"
                  >
                    Hold Position
                  </button>
                </motion.div>
              )}

              {/* PROMOTING (transition from queue to granted) */}
              {state === "promoting" && (
                <motion.div
                  key="promoting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <PromotionTransition onComplete={handlePromotionComplete} />
                </motion.div>
              )}
            </AnimatePresence>
          </MeasureFrame>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-5 md:px-8 py-4 border-t border-hair">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-fog">
          <p className="font-mono">{globalMessages[messageIndex]}</p>
          <p className="font-mono">Last calibration: 2026-01-24</p>
        </div>
      </footer>
    </div>
  );
}

// Loading fallback for Suspense
function GateLoadingFallback() {
  return (
    <div className="min-h-screen bg-paper text-ink flex items-center justify-center">
      <div className="text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-fog animate-pulse">
          Initializing gate...
        </p>
      </div>
    </div>
  );
}

export default function GatePage() {
  return (
    <Suspense fallback={<GateLoadingFallback />}>
      <GatePageContent />
    </Suspense>
  );
}
