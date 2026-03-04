/**
 * Badge – retro-themed badge/tag component.
 */

interface BadgeProps {
  children: React.ReactNode;
  variant?: "green" | "yellow" | "red" | "blue" | "gray";
}

// PUBLIC_INTERFACE
/** Retro-styled badge for status indicators and labels */
export default function Badge({
  children,
  variant = "green",
}: BadgeProps) {
  const variants = {
    green: "bg-retro-green text-retro-dark",
    yellow: "bg-retro-yellow text-retro-dark",
    red: "bg-retro-red text-white",
    blue: "bg-retro-blue text-white",
    gray: "bg-retro-muted text-white",
  };

  return (
    <span
      className={`inline-block border-2 border-retro-dark font-mono text-xs font-bold uppercase tracking-widest px-2 py-0.5 ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
