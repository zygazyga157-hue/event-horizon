"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface LedgerFormProps {
  onSubmit: (data: LedgerFormData) => Promise<void>;
  isLoading?: boolean;
}

export interface LedgerFormData {
  displayName: string;
  email: string;
  purpose: string;
  consent: boolean;
}

const purposes = [
  { value: "", label: "Select purpose (optional)" },
  { value: "Recruiter", label: "Recruiter" },
  { value: "Client", label: "Client" },
  { value: "Collaborator", label: "Collaborator" },
  { value: "Curious", label: "Curious" },
];

/**
 * Gate sign-in form - "Sign the Ledger"
 */
export function LedgerForm({ onSubmit, isLoading = false }: LedgerFormProps) {
  const [formData, setFormData] = useState<LedgerFormData>({
    displayName: "",
    email: "",
    purpose: "",
    consent: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = "Name is required";
    } else if (formData.displayName.length < 2) {
      newErrors.displayName = "Name must be at least 2 characters";
    } else if (formData.displayName.length > 64) {
      newErrors.displayName = "Name must be at most 64 characters";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.consent) {
      newErrors.consent = "You must accept the terms";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    await onSubmit(formData);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Display Name */}
      <div className="space-y-2">
        <label
          htmlFor="displayName"
          className="block font-mono text-xs uppercase tracking-plaque text-fog"
        >
          Display Name *
        </label>
        <input
          type="text"
          id="displayName"
          name="displayName"
          value={formData.displayName}
          onChange={handleChange}
          placeholder="Your name"
          disabled={isLoading}
          className={`w-full px-4 py-3 bg-paper border rounded-lg font-sans text-ink placeholder:text-fog/50 focus:outline-none focus:ring-2 focus:ring-ink transition-colors ${
            errors.displayName ? "border-ink" : "border-hair"
          }`}
        />
        {errors.displayName && (
          <p className="text-sm text-ink font-mono">{errors.displayName}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block font-mono text-xs uppercase tracking-plaque text-fog"
        >
          Email (optional)
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your@email.com"
          disabled={isLoading}
          className={`w-full px-4 py-3 bg-paper border rounded-lg font-sans text-ink placeholder:text-fog/50 focus:outline-none focus:ring-2 focus:ring-ink transition-colors ${
            errors.email ? "border-ink" : "border-hair"
          }`}
        />
        {errors.email && (
          <p className="text-sm text-ink font-mono">{errors.email}</p>
        )}
      </div>

      {/* Purpose */}
      <div className="space-y-2">
        <label
          htmlFor="purpose"
          className="block font-mono text-xs uppercase tracking-plaque text-fog"
        >
          Purpose
        </label>
        <select
          id="purpose"
          name="purpose"
          value={formData.purpose}
          onChange={handleChange}
          disabled={isLoading}
          className="w-full px-4 py-3 bg-paper border border-hair rounded-lg font-sans text-ink focus:outline-none focus:ring-2 focus:ring-ink transition-colors"
        >
          {purposes.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* Honeypot - hidden from users, visible to bots */}
      <input
        type="text"
        name="honeypot"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px] opacity-0 h-0 w-0"
      />

      {/* Consent */}
      <div className="space-y-2">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            name="consent"
            checked={formData.consent}
            onChange={handleChange}
            disabled={isLoading}
            className="mt-1 h-4 w-4 rounded border-hair text-ink focus:ring-ink"
          />
          <span className="text-sm text-fog group-hover:text-ink transition-colors">
            I understand this is a limited-capacity library. My session will
            expire if inactive.
          </span>
        </label>
        {errors.consent && (
          <p className="text-sm text-ink font-mono">{errors.consent}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 bg-ink text-paper font-mono uppercase tracking-wider rounded-lg hover:bg-ink/90 focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Calibrating..." : "Sign the Ledger"}
      </button>
    </motion.form>
  );
}
