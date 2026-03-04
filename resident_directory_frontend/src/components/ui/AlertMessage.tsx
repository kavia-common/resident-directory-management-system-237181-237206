/**
 * AlertMessage – retro-styled alert for errors and success messages.
 */

interface AlertMessageProps {
  type: "error" | "success" | "info" | "warning";
  message: string;
  onClose?: () => void;
}

// PUBLIC_INTERFACE
/** Retro-styled alert message with optional close button */
export default function AlertMessage({ type, message, onClose }: AlertMessageProps) {
  const styles = {
    error: "bg-retro-red text-white border-retro-dark",
    success: "bg-retro-green text-retro-dark border-retro-dark",
    warning: "bg-retro-yellow text-retro-dark border-retro-dark",
    info: "bg-retro-blue text-white border-retro-dark",
  };

  const icons = {
    error: "✗",
    success: "✓",
    warning: "⚠",
    info: "ℹ",
  };

  return (
    <div
      className={`flex items-start gap-3 border-2 px-4 py-3 font-mono text-sm ${styles[type]}`}
      role="alert"
    >
      <span className="text-base font-bold flex-shrink-0">{icons[type]}</span>
      <span className="flex-1">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 font-bold hover:opacity-70 focus:outline-none"
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  );
}
