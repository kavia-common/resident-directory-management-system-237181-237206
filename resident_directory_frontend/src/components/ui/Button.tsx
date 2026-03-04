/**
 * Button – retro-themed button component.
 */
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

// PUBLIC_INTERFACE
/** Retro-styled button with variants and loading state */
export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "font-mono font-bold uppercase tracking-widest border-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 inline-flex items-center justify-center gap-2 cursor-pointer";

  const variants = {
    primary:
      "bg-retro-green text-retro-dark border-retro-dark shadow-[3px_3px_0_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] focus:ring-retro-green",
    secondary:
      "bg-retro-yellow text-retro-dark border-retro-dark shadow-[3px_3px_0_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] focus:ring-retro-yellow",
    danger:
      "bg-retro-red text-white border-retro-dark shadow-[3px_3px_0_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] focus:ring-retro-red",
    ghost:
      "bg-transparent text-retro-dark border-retro-dark hover:bg-retro-dark hover:text-retro-green focus:ring-retro-dark",
  };

  const sizes = {
    sm: "px-3 py-1 text-xs",
    md: "px-5 py-2 text-sm",
    lg: "px-7 py-3 text-base",
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${disabled || loading ? "opacity-60 cursor-not-allowed" : ""} ${className}`}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
