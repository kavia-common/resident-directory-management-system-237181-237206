/**
 * Select – retro-themed select/dropdown component.
 */
import React from "react";

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

// PUBLIC_INTERFACE
/** Retro-styled select dropdown with optional label and error message */
export default function Select({
  label,
  error,
  id,
  options,
  placeholder,
  className = "",
  ...props
}: SelectProps) {
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
      <select
        id={inputId}
        {...props}
        className={`font-mono border-2 border-retro-dark bg-retro-cream px-3 py-2 text-sm text-retro-dark focus:outline-none focus:border-retro-green focus:bg-white transition-colors ${error ? "border-retro-red" : ""} ${className}`}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="font-mono text-xs text-retro-red">{error}</p>
      )}
    </div>
  );
}
