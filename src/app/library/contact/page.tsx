"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { MeasureFrame } from "@/components/MeasureFrame";
import { HeartbeatClient } from "@/components/Gate";
import { useSessionErrors } from "@/hooks/useSessionErrors";
import { contactCopy } from "@/content";

export default function ContactPage() {
  const { handleSessionExpired, handleSessionInvalid, handleNetworkError } = useSessionErrors();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    interestType: "",
    budgetRange: "",
    timeline: "",
    message: "",
    honeypot: "", // Bot trap
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Verify session on mount
  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await fetch("/api/gate/status", { credentials: "include" });
        if (!res.ok) {
          handleSessionInvalid();
        }
      } catch {
        handleNetworkError();
      }
    };
    verifySession();
  }, [handleSessionInvalid, handleNetworkError]);

  const availabilityStyles = {
    open: { bg: "bg-ink", text: "text-paper", dot: "bg-paper" },
    selective: { bg: "bg-hair", text: "text-ink", dot: "bg-ink" },
    unavailable: { bg: "bg-hair", text: "text-fog", dot: "bg-fog" },
  };
  const availabilityLabels = {
    open: "Open to Work",
    selective: "Selectively Available",
    unavailable: "Currently Unavailable",
  };
  const avail = availabilityStyles[contactCopy.availability.status];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Bot trap check
    if (formData.honeypot) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setSubmitted(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to send message. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Heartbeat client for session management */}
      <HeartbeatClient enabled onExpired={handleSessionExpired} />

      {/* Header */}
      <header className="border-b border-hair bg-paper/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/library"
              className="font-display text-xl tracking-tight hover:opacity-70 transition-opacity"
            >
              The Atrium
            </Link>
            <nav className="hidden md:flex items-center gap-4 text-sm text-fog">
              <Link href="/library" className="hover:text-ink transition-colors">
                Exhibits
              </Link>
              <Link href="/library/archive" className="hover:text-ink transition-colors">
                Archive
              </Link>
              <Link href="/library/about" className="hover:text-ink transition-colors">
                About
              </Link>
              <span className="text-ink font-medium">Contact</span>
            </nav>
          </div>
          <Link
            href="/gate"
            className="px-4 py-2 text-sm border border-hair rounded-lg hover:bg-ink/5 transition-colors"
          >
            Exit Gallery
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Page title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="font-mono text-xs uppercase tracking-widest text-fog mb-2">
            {contactCopy.metaLine}
          </p>
          <h1 className="text-4xl font-medium tracking-tight mb-4">
            {contactCopy.pageTitle}
          </h1>
          <p className="text-lg text-fog leading-relaxed max-w-2xl">
            {contactCopy.subheading}
          </p>
        </motion.div>

        {/* Availability Status */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12"
        >
          <MeasureFrame
            meta="AVAILABILITY"
            showMeta
            className="p-6 bg-paper shadow-museum rounded-2xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${avail.bg} ${avail.text}`}>
                  <span className={`w-2 h-2 rounded-full ${avail.dot} animate-pulse`} />
                  {availabilityLabels[contactCopy.availability.status]}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-fog font-mono">
                <span>Timezone: {contactCopy.availability.timezone}</span>
                <span>Response: {contactCopy.availability.responseTime}</span>
              </div>
            </div>
          </MeasureFrame>
        </motion.section>

        {/* Contact Info */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mb-12"
        >
          <h2 className="font-mono text-xs uppercase tracking-widest text-fog mb-6">
            Direct Contact
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <MeasureFrame
              meta="PREFERRED"
              showMeta
              className="p-6 bg-paper shadow-museum rounded-2xl"
            >
              <h3 className="font-mono text-xs uppercase tracking-plaque text-fog mb-3">
                Email
              </h3>
              <a
                href={`mailto:${contactCopy.contact.email}`}
                className="text-lg font-medium hover:underline underline-offset-4"
              >
                {contactCopy.contact.email}
              </a>
              <p className="text-sm text-fog mt-2">
                Best for detailed inquiries and project discussions.
              </p>
            </MeasureFrame>

            {/* WhatsApp */}
            <a
              href={contactCopy.contact.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <MeasureFrame
                showMeta={false}
                className="p-6 bg-paper border border-hair rounded-2xl hover:shadow-museum transition-shadow h-full"
              >
                <h3 className="font-mono text-xs uppercase tracking-plaque text-fog mb-3">
                  WhatsApp
                </h3>
                <p className="text-lg font-medium">
                  Send a message →
                </p>
                <p className="text-sm text-fog mt-2">
                  For quick questions or scheduling.
                </p>
              </MeasureFrame>
            </a>
          </div>
        </motion.section>

        {/* Contact Instructions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <MeasureFrame
            meta="HOW TO REACH OUT"
            showMeta
            className="p-6 bg-paper shadow-museum rounded-2xl"
          >
            <p className="text-ink leading-relaxed whitespace-pre-line">
              {contactCopy.intro}
            </p>
          </MeasureFrame>
        </motion.section>

        {/* Work Types */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mb-12"
        >
          <h2 className="font-mono text-xs uppercase tracking-widest text-fog mb-6">
            Work Opportunities Accepted
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contactCopy.opportunities.types.map((type, index) => (
              <motion.div
                key={type.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              >
                <MeasureFrame
                  showMeta={false}
                  className="p-5 bg-paper border border-hair rounded-2xl h-full"
                >
                  <h3 className="font-medium mb-1">{type.label}</h3>
                  <p className="text-sm text-fog">{type.description}</p>
                </MeasureFrame>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Industries */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mb-12"
        >
          <h2 className="font-mono text-xs uppercase tracking-widest text-fog mb-6">
            Industries of Interest
          </h2>
          <div className="flex flex-wrap gap-3">
            {contactCopy.opportunities.industries.map((industry) => (
              <span
                key={industry}
                className="px-4 py-2 bg-hair text-ink text-sm font-mono rounded-full"
              >
                {industry}
              </span>
            ))}
          </div>
        </motion.section>

        {/* Deliverables */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="font-mono text-xs uppercase tracking-widest text-fog mb-6">
            What I Can Deliver
          </h2>
          <MeasureFrame
            meta="DELIVERABLES"
            showMeta
            className="p-6 bg-paper shadow-museum rounded-2xl"
          >
            <ul className="space-y-3">
              {contactCopy.opportunities.deliverables.map((item, index) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <span className="mt-2 w-1.5 h-1.5 bg-ink rounded-full shrink-0" />
                  <span className="text-ink">{item}</span>
                </motion.li>
              ))}
            </ul>
          </MeasureFrame>
        </motion.section>

        {/* Contact Form */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-12"
        >
          <h2 className="font-mono text-xs uppercase tracking-widest text-fog mb-6">
            {contactCopy.cta}
          </h2>
          
          {submitted ? (
            <MeasureFrame
              meta="MESSAGE SENT"
              showMeta
              className="p-8 bg-paper shadow-museum rounded-2xl text-center"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 mx-auto bg-ink text-paper rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium">Message Received</h3>
                <p className="text-fog">
                  Thank you for reaching out. I'll respond within {contactCopy.availability.responseTime}.
                </p>
              </div>
            </MeasureFrame>
          ) : (
            <MeasureFrame
              meta="CONTACT FORM"
              showMeta
              className="p-8 bg-paper shadow-museum rounded-2xl"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Honeypot - hidden from users, catches bots */}
                <input
                  type="text"
                  name="honeypot"
                  value={formData.honeypot}
                  onChange={handleChange}
                  className="absolute -left-[9999px] opacity-0 h-0 w-0"
                  tabIndex={-1}
                  autoComplete="off"
                />

                {/* Name & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-xs uppercase tracking-plaque text-fog mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-paper border border-hair rounded-lg text-ink placeholder:text-fog focus:outline-none focus:border-ink transition-colors"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-xs uppercase tracking-plaque text-fog mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-paper border border-hair rounded-lg text-ink placeholder:text-fog focus:outline-none focus:border-ink transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                {/* Organization */}
                <div>
                  <label className="block font-mono text-xs uppercase tracking-plaque text-fog mb-2">
                    Organization (optional)
                  </label>
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-paper border border-hair rounded-lg text-ink placeholder:text-fog focus:outline-none focus:border-ink transition-colors"
                    placeholder="Company or project name"
                  />
                </div>

                {/* Interest Type */}
                <div>
                  <label className="block font-mono text-xs uppercase tracking-plaque text-fog mb-2">
                    Interest Type
                  </label>
                  <select
                    name="interestType"
                    value={formData.interestType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-paper border border-hair rounded-lg text-ink focus:outline-none focus:border-ink transition-colors"
                  >
                    <option value="">Select an option</option>
                    {contactCopy.formFields.interestTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Budget & Timeline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-xs uppercase tracking-plaque text-fog mb-2">
                      Budget Range (optional)
                    </label>
                    <input
                      type="text"
                      name="budgetRange"
                      value={formData.budgetRange}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-paper border border-hair rounded-lg text-ink placeholder:text-fog focus:outline-none focus:border-ink transition-colors"
                      placeholder="e.g., $5k-$10k"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-xs uppercase tracking-plaque text-fog mb-2">
                      Timeline (optional)
                    </label>
                    <input
                      type="text"
                      name="timeline"
                      value={formData.timeline}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-paper border border-hair rounded-lg text-ink placeholder:text-fog focus:outline-none focus:border-ink transition-colors"
                      placeholder="e.g., 2-4 weeks"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block font-mono text-xs uppercase tracking-plaque text-fog mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-paper border border-hair rounded-lg text-ink placeholder:text-fog focus:outline-none focus:border-ink transition-colors resize-none"
                    placeholder="Describe the problem you want solved, constraints, and any relevant context..."
                  />
                </div>

                {/* Error Message */}
                {submitError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{submitError}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-4 bg-ink text-paper rounded-lg hover:bg-ink/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isSubmitting ? "Sending..." : contactCopy.cta}
                </button>
              </form>
            </MeasureFrame>
          )}
        </motion.section>

        {/* Footer motif */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 pt-8 border-t border-hair text-center"
        >
          <p className="font-mono text-xs text-fog">{contactCopy.footerLine}</p>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-hair mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-mono text-xs text-fog">
              PROJECT ZYGA — Event Horizon Gallery
            </p>
            <div className="flex items-center gap-6 text-xs text-fog font-mono">
              <Link href="/library/about" className="hover:text-ink transition-colors">
                About
              </Link>
              <Link href="/library/contact" className="hover:text-ink transition-colors">
                Contact
              </Link>
              <Link href="/library/archive" className="hover:text-ink transition-colors">
                Archive
              </Link>
              <a
                href="mailto:zygazyga157@gmail.com"
                className="hover:text-ink transition-colors"
              >
                zygazyga157@gmail.com
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
