"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import WaveSurfer from "wavesurfer.js";
import { motion } from "framer-motion";

export interface AudioPlayerProps {
  src: string;
  label: string;
  peaksUrl?: string;
  onReady?: () => void;
  onError?: (error: Error) => void;
}

/**
 * AudioPlayer - Museum-styled audio player with wavesurfer.js waveform
 * Features: dark theme, peak caching, responsive design, volume control
 */
export function AudioPlayer({
  src,
  label,
  peaksUrl,
  onReady,
  onError,
}: AudioPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [error, setError] = useState<string | null>(null);

  // Format time in MM:SS
  const formatTime = useCallback((seconds: number): string => {
    if (!isFinite(seconds) || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Initialize WaveSurfer
  useEffect(() => {
    if (!containerRef.current) return;

    // Track if component is still mounted
    let isMounted = true;
    const abortController = new AbortController();

    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "rgba(250, 250, 250, 0.4)",
      progressColor: "#FAFAFA",
      cursorColor: "#FAFAFA",
      cursorWidth: 1,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 64,
      normalize: true,
      backend: "WebAudio",
      // Peak data for caching (if provided)
      peaks: undefined,
    });

    wavesurferRef.current = wavesurfer;

    // Event handlers - only update state if still mounted
    wavesurfer.on("ready", () => {
      if (!isMounted) return;
      setIsLoading(false);
      setDuration(wavesurfer.getDuration());
      wavesurfer.setVolume(volume);
      onReady?.();
    });

    // Fallback: also listen for decode event which fires when audio is decoded
    wavesurfer.on("decode", (decodedDuration: number) => {
      if (!isMounted) return;
      if (decodedDuration > 0) {
        setDuration(decodedDuration);
      }
    });

    wavesurfer.on("audioprocess", () => {
      if (!isMounted) return;
      setCurrentTime(wavesurfer.getCurrentTime());
    });

    wavesurfer.on("seeking", () => {
      if (!isMounted) return;
      setCurrentTime(wavesurfer.getCurrentTime());
    });

    wavesurfer.on("play", () => isMounted && setIsPlaying(true));
    wavesurfer.on("pause", () => isMounted && setIsPlaying(false));
    wavesurfer.on("finish", () => isMounted && setIsPlaying(false));

    wavesurfer.on("error", (err) => {
      if (!isMounted) return;
      const errorMsg = err instanceof Error ? err.message : String(err);
      // Ignore abort errors (expected during cleanup)
      if (errorMsg.includes("abort") || errorMsg.includes("Abort")) return;
      setError(`Failed to load audio: ${errorMsg}`);
      setIsLoading(false);
      onError?.(err instanceof Error ? err : new Error(errorMsg));
    });

    // Load audio with peaks if available
    const loadAudio = async () => {
      try {
        if (peaksUrl && isMounted) {
          // Load pre-generated peaks for faster rendering
          const response = await fetch(peaksUrl, { signal: abortController.signal });
          if (response.ok && isMounted) {
            const peaks = await response.json();
            wavesurfer.load(src, peaks.data);
            return;
          }
        }
        // Fallback: load and generate peaks
        if (isMounted) {
          wavesurfer.load(src);
        }
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === "AbortError") return;
        if (isMounted) {
          wavesurfer.load(src);
        }
      }
    };

    loadAudio();

    return () => {
      isMounted = false;
      abortController.abort();
      // Safely destroy WaveSurfer
      try {
        wavesurfer.destroy();
      } catch {
        // Ignore errors during cleanup (e.g., abort-related)
      }
    };
  }, [src, peaksUrl, onReady, onError, volume]);

  // Update volume when changed
  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(volume);
    }
  }, [volume]);

  // Play/Pause toggle
  const togglePlayPause = useCallback(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  }, []);

  // Skip forward/backward
  const skip = useCallback((seconds: number) => {
    if (wavesurferRef.current) {
      const newTime = Math.max(0, Math.min(currentTime + seconds, duration));
      wavesurferRef.current.seekTo(newTime / duration);
    }
  }, [currentTime, duration]);

  if (error) {
    return (
      <div className="rounded-2xl bg-ink p-6 text-paper">
        <p className="font-mono text-xs text-paper/60">{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-ink p-6 shadow-museum-lg">
      {/* Track Label */}
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-widest text-paper/60">
          Now Playing
        </span>
        <span className="font-mono text-xs text-paper/40">
          ZYGA-SM
        </span>
      </div>
      
      <h3 className="mb-6 font-mono text-sm font-medium text-paper">
        {label}
      </h3>

      {/* Waveform Container */}
      <div className="relative mb-6">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="h-0.5 w-16 bg-paper/40"
              animate={{ scaleX: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        )}
        <div 
          ref={containerRef} 
          className={`w-full h-16 ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        />
      </div>

      {/* Time Display */}
      <div className="mb-4 flex justify-between font-mono text-xs text-paper/60">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Playback Controls */}
        <div className="flex items-center gap-3">
          {/* Skip Back */}
          <button
            onClick={() => skip(-10)}
            disabled={isLoading}
            className="flex h-8 w-8 items-center justify-center rounded-full text-paper/60 transition-colors hover:bg-paper/10 hover:text-paper disabled:opacity-40"
            aria-label="Skip back 10 seconds"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
            </svg>
          </button>

          {/* Play/Pause */}
          <motion.button
            onClick={togglePlayPause}
            disabled={isLoading}
            whileTap={{ scale: 0.95 }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-paper text-ink transition-colors hover:bg-paper/90 disabled:opacity-40"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="ml-0.5 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </motion.button>

          {/* Skip Forward */}
          <button
            onClick={() => skip(10)}
            disabled={isLoading}
            className="flex h-8 w-8 items-center justify-center rounded-full text-paper/60 transition-colors hover:bg-paper/10 hover:text-paper disabled:opacity-40"
            aria-label="Skip forward 10 seconds"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
            </svg>
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-paper/60 transition-colors hover:bg-paper/10 hover:text-paper"
            aria-label={volume === 0 ? "Unmute" : "Mute"}
          >
            {volume === 0 ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-paper/20 accent-paper [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-paper"
            aria-label="Volume"
          />
        </div>
      </div>

      {/* Headphones Notice */}
      <div className="mt-6 flex items-center gap-2 border-t border-paper/10 pt-4">
        <svg className="h-4 w-4 text-paper/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
        </svg>
        <span className="font-mono text-xs text-paper/40">
          Stereo headphones recommended for binaural beats
        </span>
      </div>
    </div>
  );
}
