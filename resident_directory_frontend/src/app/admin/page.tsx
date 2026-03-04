"use client";

/**
 * Admin panel landing page – links to all admin management sections.
 */
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();

  // Redirect non-admins
  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [loading, isAdmin, router]);

  if (loading || !isAdmin) return null;

  const sections = [
    {
      href: "/admin/residents",
      label: "Residents",
      icon: "◉",
      desc: "Create, update and delete resident profiles",
      color: "border-retro-green",
    },
    {
      href: "/admin/buildings",
      label: "Buildings",
      icon: "🏢",
      desc: "Manage buildings and complexes",
      color: "border-retro-yellow",
    },
    {
      href: "/admin/announcements",
      label: "Announcements",
      icon: "📢",
      desc: "Post and manage community announcements",
      color: "border-retro-blue",
    },
    {
      href: "/admin/users",
      label: "Users",
      icon: "👤",
      desc: "Manage user accounts and roles",
      color: "border-retro-red",
    },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Admin Panel"
        subtitle="System administration controls"
      />

      <div className="mb-6 border-4 border-retro-yellow bg-retro-yellow/20 p-4">
        <p className="font-mono text-sm text-retro-dark">
          ⚙ You have administrator access. Use these controls responsibly.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className={`block border-4 ${s.color} bg-retro-cream p-6 shadow-[6px_6px_0_#000] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all`}
          >
            <div className="font-mono text-4xl mb-3">{s.icon}</div>
            <div className="font-mono font-bold text-retro-dark text-lg uppercase tracking-wide mb-1">
              {s.label}
            </div>
            <p className="font-mono text-sm text-retro-muted">{s.desc}</p>
            <div className="mt-4 font-mono text-xs font-bold uppercase tracking-widest text-retro-green">
              Manage →
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
