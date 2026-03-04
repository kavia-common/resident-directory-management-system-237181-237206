"use client";

/**
 * Sidebar – retro-themed navigation sidebar component.
 * Shows different nav items based on user role.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "⌂" },
  { href: "/directory", label: "Directory", icon: "☰" },
  { href: "/announcements", label: "Announcements", icon: "📢" },
  { href: "/messages", label: "Messages", icon: "✉" },
  { href: "/profile", label: "My Profile", icon: "◉" },
  { href: "/admin", label: "Admin Panel", icon: "⚙", adminOnly: true },
];

// PUBLIC_INTERFACE
/** Sidebar navigation with retro theme and role-based menu items */
export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || isAdmin
  );

  return (
    <aside className="flex flex-col h-full bg-retro-dark text-retro-green border-r-4 border-retro-green w-64 min-h-screen">
      {/* Logo / Header */}
      <div className="border-b-4 border-retro-green px-4 py-5">
        <div className="font-mono text-retro-yellow text-xs uppercase tracking-widest mb-1">
          ▶ RESIDENT SYS v1.0
        </div>
        <div className="font-mono text-retro-green text-lg font-bold leading-tight">
          DIRECTORY
          <br />
          MGMT
        </div>
        <div className="mt-1 font-mono text-retro-muted text-xs">
          ████████████
        </div>
      </div>

      {/* User info */}
      {user && (
        <div className="border-b-4 border-retro-green px-4 py-3">
          <div className="font-mono text-xs text-retro-muted uppercase tracking-widest">
            Logged in as:
          </div>
          <div className="font-mono text-retro-green font-bold text-sm truncate">
            {user.username}
          </div>
          <div className="font-mono text-retro-yellow text-xs uppercase">
            [{user.role}]
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4" aria-label="Main navigation">
        <ul className="space-y-1 px-2">
          {visibleItems.map((item) => {
            const active =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 font-mono text-sm font-bold uppercase tracking-wider transition-colors border-2 ${
                    active
                      ? "bg-retro-green text-retro-dark border-retro-green"
                      : "border-transparent text-retro-green hover:border-retro-green hover:bg-retro-green/10"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="text-base w-5 text-center">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="border-t-4 border-retro-green px-4 py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="w-full text-retro-green border-retro-green hover:bg-retro-red hover:border-retro-red hover:text-white"
        >
          ⏻ Logout
        </Button>
      </div>
    </aside>
  );
}
