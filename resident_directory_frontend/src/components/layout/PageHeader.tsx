/**
 * PageHeader – retro-styled page title and description header.
 */

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

// PUBLIC_INTERFACE
/** Retro-styled page header with title, optional subtitle and action slot */
export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4 border-b-4 border-retro-dark pb-4">
      <div>
        <div className="font-mono text-xs text-retro-muted uppercase tracking-widest mb-1">
          ▶ SYS OUTPUT
        </div>
        <h1 className="font-mono text-2xl font-bold uppercase tracking-wide text-retro-dark">
          {title}
        </h1>
        {subtitle && (
          <p className="font-mono text-sm text-retro-muted mt-1">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
