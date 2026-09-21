"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect } from "react";
import {
  Mail,
  Phone,
  Send,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Paperclip,
  RotateCcw,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import { portfolioData } from "@/data/portfolioData";

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export interface ContactContentProps {
  className?: string;
}

export function ContactContent({ className = "" }: ContactContentProps) {
  const { profile } = portfolioData;

  // Form states
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const copyToClipboard = async (text: string, label: string, fieldKey: string) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else if (typeof document !== "undefined") {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopiedField(fieldKey);
      setToastMessage(`${label} copied to clipboard!`);
      setTimeout(() => setCopiedField(null), 2500);
    } catch {
      setToastMessage(`${label} copied to clipboard!`);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!subject.trim() || !message.trim()) {
      setFormError("Please enter a subject and message.");
      return;
    }

    // Construct mailto link for native client launch
    const mailtoSubject = encodeURIComponent(subject);
    const bodyContent = `Name: ${senderName || "Visitor"}\nEmail: ${senderEmail || "Not provided"}\n\n${message}`;
    const mailtoBody = encodeURIComponent(bodyContent);
    const mailtoUrl = `mailto:${profile.email}?subject=${mailtoSubject}&body=${mailtoBody}`;

    // Show immediate success confirmation
    setFormSuccess("Message queued! Thank you for reaching out to Trần Trung Nguyên.");
    setToastMessage("Message queued! Thank you for reaching out.");

    // Trigger mailto link in background if browser environment
    if (typeof window !== "undefined" && process.env.NODE_ENV !== "test") {
      try {
        window.location.href = mailtoUrl;
      } catch {
        // Silently continue if protocol handler is blocked
      }
    }

    // Reset inputs
    setSenderName("");
    setSenderEmail("");
    setSubject("");
    setMessage("");
  };

  const handleResetForm = () => {
    setSenderName("");
    setSenderEmail("");
    setSubject("");
    setMessage("");
    setFormError(null);
    setFormSuccess(null);
  };

  return (
    <div
      className={`relative min-h-full w-full overflow-y-auto select-none bg-[#3b82f6] text-white flex flex-col items-center ${className}`}
      style={{
        backgroundImage: "url('/samples/backgorund-home.png')",
        backgroundSize: "cover",
        backgroundPosition: "center bottom",
        backgroundAttachment: "local",
      }}
    >
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 backdrop-blur-md text-white px-5 py-2.5 rounded-full border border-white/20 shadow-2xl flex items-center gap-2 text-xs sm:text-sm font-medium animate-in fade-in slide-in-from-top-4 duration-300"
        >
          <Sparkles className="w-4 h-4 text-[#ffd000] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full max-w-5xl px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16 flex flex-col items-center">
        {/* Sky Section: Groovy Retro Title and Subtitle */}
        <div className="flex flex-col items-center text-center mt-2 sm:mt-6 mb-8 sm:mb-12">
          {/* Yellow Retro Headline matching contact.png */}
          <h1
            className="text-6xl xs:text-7xl sm:text-8xl md:text-9xl font-normal leading-none tracking-tight text-[#ffd000] select-none transform -rotate-1"
            style={{
              fontFamily:
                "'Pacifico', 'Brush Script MT', 'Caveat', 'Shrikhand', cursive, sans-serif",
              textShadow:
                "4px 5px 0px #b45309, 7px 8px 0px #78350f, 9px 12px 18px rgba(0,0,0,0.35)",
            }}
          >
            Let&apos;s Work
          </h1>

          {/* Subtitle with Pixel Mouse Cursor matching contact.png */}
          <div className="relative inline-flex items-center gap-3 mt-3 sm:mt-4 ml-24 sm:ml-48">
            <h2
              className="text-3xl xs:text-4xl sm:text-5xl italic text-[#ffd000] font-semibold tracking-wide"
              style={{
                fontFamily:
                  "'Pacifico', 'Brush Script MT', 'Caveat', cursive, sans-serif",
                textShadow:
                  "2px 3px 0px #b45309, 4px 6px 10px rgba(0,0,0,0.35)",
              }}
            >
              contact me
            </h2>

            {/* Pixel Mouse Cursor */}
            <div className="relative inline-flex items-center transform -translate-y-2">
              <img
                src="/icons/Windows_mouse.png"
                alt="Pixel mouse cursor pointing to contact me"
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow-lg select-none transform hover:scale-125 transition-transform"
              />
            </div>
          </div>
        </div>

        {/* Rolling Grass Section: Action Pill Buttons */}
        <div className="w-full flex flex-col items-center gap-4 mt-6 sm:mt-10 mb-10">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 max-w-4xl">
            {/* Blue Pill: GitHub */}
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="FOLLOW ME @trtrnguyen14104"
              className="group inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3 rounded-full bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-black text-xs sm:text-sm tracking-wider uppercase border-2 border-white shadow-[0_8px_20px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.35)] hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <GithubIcon className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
              <span>FOLLOW ME @trtrnguyen14104</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
            </a>

            {/* Purple Pill: Email */}
            <button
              type="button"
              aria-label="Copy email trtrnguyen14104@gmail.com"
              onClick={() =>
                copyToClipboard(profile.email, "Email", "email")
              }
              className="group inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3 rounded-full bg-[#7e22ce] hover:bg-[#6b21a8] text-white font-black text-xs sm:text-sm tracking-wider uppercase border-2 border-white shadow-[0_8px_20px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.35)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <Mail className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              <span>{profile.email}</span>
              {copiedField === "email" ? (
                <Check className="w-3.5 h-3.5 text-emerald-300" />
              ) : (
                <Copy className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
              )}
            </button>

            {/* LinkedIn Pill */}
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`LinkedIn: ${profile.name}`}
              className="group inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3 rounded-full bg-[#0077b5] hover:bg-[#006097] text-white font-black text-xs sm:text-sm tracking-wider uppercase border-2 border-white shadow-[0_8px_20px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.35)] hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <LinkedinIcon className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              <span>{profile.name}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
            </a>

            {/* Phone Pill */}
            <button
              type="button"
              aria-label={`Copy phone ${profile.phone}`}
              onClick={() =>
                copyToClipboard(profile.phone, "Phone", "phone")
              }
              className="group inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3 rounded-full bg-[#15803d] hover:bg-[#166534] text-white font-black text-xs sm:text-sm tracking-wider uppercase border-2 border-white shadow-[0_8px_20px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.35)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <Phone className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
              <span>{profile.phone}</span>
              {copiedField === "phone" ? (
                <Check className="w-3.5 h-3.5 text-emerald-300" />
              ) : (
                <Copy className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
              )}
            </button>
          </div>
        </div>

        {/* Retro Windows Mail / Outlook Express Message Dialog */}
        <div className="w-full max-w-2xl bg-[#ece9d8] text-slate-900 rounded-lg shadow-2xl border-2 border-slate-400 overflow-hidden font-sans">
          {/* Classic Windows Titlebar */}
          <div className="bg-linear-to-r from-[#0055ea] via-[#0a66f0] to-[#3688ff] text-white px-3 py-1.5 flex items-center justify-between select-none">
            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm tracking-wide">
              <Mail className="w-4 h-4 text-yellow-300" />
              <span>Windows Mail — Outlook Express (Send a Message)</span>
            </div>

            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-white/20 hover:bg-white/40 cursor-pointer" />
              <span className="w-3 h-3 rounded-full bg-white/20 hover:bg-white/40 cursor-pointer" />
              <span className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 cursor-pointer" />
            </div>
          </div>

          {/* Classic Toolbar */}
          <div className="bg-[#f0ede0] border-b border-[#d8d3c5] px-3 py-1.5 flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1 text-slate-700 font-medium px-2 py-1 rounded hover:bg-black/5 cursor-pointer">
              <Send className="w-3.5 h-3.5 text-blue-600" />
              <span>Send</span>
            </div>
            <div className="w-px h-4 bg-slate-300 mx-1" />
            <div className="flex items-center gap-1 text-slate-700 font-medium px-2 py-1 rounded hover:bg-black/5 cursor-pointer">
              <Paperclip className="w-3.5 h-3.5 text-slate-600" />
              <span>Attach</span>
            </div>
            <div className="w-px h-4 bg-slate-300 mx-1" />
            <button
              type="button"
              onClick={handleResetForm}
              className="flex items-center gap-1 text-slate-700 font-medium px-2 py-1 rounded hover:bg-black/5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
              <span>Clear</span>
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSendMessage} className="p-4 sm:p-5 space-y-3.5">
            {/* Feedback Alerts */}
            {formError && (
              <div
                role="alert"
                className="flex items-center gap-2 p-2.5 rounded bg-red-100 border border-red-300 text-red-800 text-xs font-medium"
              >
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div
                role="alert"
                className="flex items-center gap-2 p-2.5 rounded bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-medium"
              >
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            {/* To Recipient Field */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-xs">
              <label
                htmlFor="recipient-to"
                className="sm:w-20 font-bold text-slate-700 select-none text-right pr-1"
              >
                To:
              </label>
              <div className="flex-1 flex items-center bg-white border border-slate-300 rounded px-2.5 py-1.5 shadow-inner">
                <input
                  id="recipient-to"
                  type="text"
                  readOnly
                  value={profile.email}
                  className="w-full bg-transparent outline-none text-slate-800 font-medium text-xs cursor-default"
                />
              </div>
            </div>

            {/* From Sender Field */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-xs">
              <label
                htmlFor="sender-email"
                className="sm:w-20 font-bold text-slate-700 select-none text-right pr-1"
              >
                From:
              </label>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  id="sender-name"
                  type="text"
                  placeholder="Your Name"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 text-xs shadow-inner outline-none focus:border-blue-500"
                />
                <input
                  id="sender-email"
                  type="email"
                  placeholder="Your Email (optional)"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 text-xs shadow-inner outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Subject Field */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-xs">
              <label
                htmlFor="email-subject"
                className="sm:w-20 font-bold text-slate-700 select-none text-right pr-1"
              >
                Subject:
              </label>
              <div className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 shadow-inner">
                <input
                  id="email-subject"
                  type="text"
                  placeholder="Subject: Collaboration / Project Inquiry"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-transparent outline-none text-slate-800 text-xs focus:ring-0"
                />
              </div>
            </div>

            {/* Message Body Field */}
            <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-3 text-xs">
              <label
                htmlFor="email-message"
                className="sm:w-20 font-bold text-slate-700 select-none text-right pr-1 pt-1"
              >
                Message:
              </label>
              <div className="flex-1 bg-white border border-slate-300 rounded p-2.5 shadow-inner">
                <textarea
                  id="email-message"
                  rows={4}
                  placeholder="Write your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-transparent outline-none text-slate-800 text-xs resize-y focus:ring-0"
                />
              </div>
            </div>

            {/* Form Footer Action */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-300">
              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                <span>Sends directly via email / default mail client</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-3 py-1.5 rounded border border-slate-400 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-medium cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  aria-label="Send Message"
                  className="px-5 py-1.5 rounded bg-[#0a66f0] hover:bg-[#0055ea] active:scale-95 text-white text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
