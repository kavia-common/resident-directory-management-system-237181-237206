/**
 * Spinner – retro-styled loading indicator.
 */
export default function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" };
  return (
    <div
      className={`${sizes[size]} animate-spin rounded-full border-4 border-retro-green border-t-transparent`}
      role="status"
      aria-label="Loading"
    />
  );
}
