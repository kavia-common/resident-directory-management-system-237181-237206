"use client";

/**
 * Dashboard page – shows a welcome screen with quick stats and recent announcements.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { announcementsApi, AnnouncementOut } from "@/lib/api";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [announcements, setAnnouncements] = useState<AnnouncementOut[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    announcementsApi
      .list({ limit: 5 })
      .then(setAnnouncements)
      .catch(() => setAnnouncements([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back, ${user?.username}!`}
      />

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { href: "/directory", label: "Directory", icon: "☰", color: "border-retro-green" },
          { href: "/announcements", label: "Announcements", icon: "📢", color: "border-retro-yellow" },
          { href: "/messages", label: "Messages", icon: "✉", color: "border-retro-blue" },
          { href: "/profile", label: "My Profile", icon: "◉", color: "border-retro-red" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block border-4 ${item.color} bg-retro-cream p-4 shadow-[4px_4px_0_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all`}
          >
            <div className="font-mono text-3xl mb-2">{item.icon}</div>
            <div className="font-mono text-xs font-bold uppercase tracking-widest text-retro-dark">
              {item.label}
            </div>
          </Link>
        ))}
      </div>

      {/* Admin links */}
      {isAdmin && (
        <div className="mb-8 border-4 border-retro-yellow bg-retro-cream p-4 shadow-[4px_4px_0_#000]">
          <div className="font-mono text-xs uppercase tracking-widest text-retro-muted mb-2">
            Admin Controls
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { href: "/admin/residents", label: "Manage Residents" },
              { href: "/admin/buildings", label: "Manage Buildings" },
              { href: "/admin/announcements", label: "Manage Announcements" },
              { href: "/admin/users", label: "Manage Users" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-mono text-xs font-bold uppercase tracking-widest border-2 border-retro-dark bg-retro-yellow text-retro-dark px-3 py-1 shadow-[2px_2px_0_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Announcements */}
      <div className="border-4 border-retro-dark bg-retro-cream p-4 shadow-[4px_4px_0_#000]">
        <div className="font-mono text-xs uppercase tracking-widest text-retro-muted mb-3 border-b-2 border-retro-dark pb-2">
          ▶ Recent Announcements
        </div>
        {loading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : announcements.length === 0 ? (
          <p className="font-mono text-sm text-retro-muted text-center py-4">
            No announcements yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {announcements.map((a) => (
              <li
                key={a.id}
                className="border-l-4 border-retro-green pl-3 py-1"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm font-bold text-retro-dark">
                    {a.title}
                  </span>
                  {a.is_pinned && <Badge variant="yellow">Pinned</Badge>}
                </div>
                <p className="font-mono text-xs text-retro-muted line-clamp-2">
                  {a.body}
                </p>
                <div className="font-mono text-xs text-retro-muted mt-1">
                  {new Date(a.created_at).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 pt-3 border-t-2 border-retro-dark">
          <Link
            href="/announcements"
            className="font-mono text-xs font-bold uppercase tracking-widest text-retro-green hover:underline"
          >
            View all announcements →
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
