"use client";

/**
 * Modal – retro-themed modal dialog component.
 */
import React, { useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

// PUBLIC_INTERFACE
/** Retro-styled modal with backdrop and close button */
export default function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const widths = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-2xl" };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-retro-dark/80"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        className={`relative z-10 w-full ${widths[size]} border-4 border-retro-dark bg-retro-cream shadow-[8px_8px_0_#000]`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-4 border-retro-dark bg-retro-dark px-4 py-2">
          <h2
            id="modal-title"
            className="font-mono text-sm font-bold uppercase tracking-widest text-retro-green"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="font-mono text-retro-green hover:text-retro-yellow text-lg leading-none focus:outline-none"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        {/* Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
