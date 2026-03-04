/**
 * Input – retro-themed input component.
 */
import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

// PUBLIC_INTERFACE
/** Retro-styled input field with optional label and error message */
export default function Input({
  label,
  error,
  id,
  className = "",
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="font-mono text-xs font-bold uppercase tracking-widest text-retro-dark"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        {...props}
        className={`font-mono border-2 border-retro-dark bg-retro-cream px-3 py-2 text-sm text-retro-dark placeholder:text-retro-muted focus:outline-none focus:border-retro-green focus:bg-white transition-colors ${error ? "border-retro-red" : ""} ${className}`}
      />
      {error && (
        <p className="font-mono text-xs text-retro-red">{error}</p>
      )}
    </div>
  );
}
