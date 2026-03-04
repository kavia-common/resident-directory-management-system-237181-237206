"use client";

/**
 * Announcements page – displays community announcements with pinned items first.
 */
import { useEffect, useState, useCallback } from "react";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { announcementsApi, buildingsApi, AnnouncementOut, BuildingOut } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Link from "next/link";
import AlertMessage from "@/components/ui/AlertMessage";

export default function AnnouncementsPage() {
  const { isAdmin } = useAuth();
  const [announcements, setAnnouncements] = useState<AnnouncementOut[]>([]);
  const [buildings, setBuildings] = useState<BuildingOut[]>([]);
  const [buildingId, setBuildingId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const buildingMap = Object.fromEntries(buildings.map((b) => [b.id, b.name]));

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [ann, blds] = await Promise.all([
        announcementsApi.list(buildingId ? { building_id: Number(buildingId) } : {}),
        buildingsApi.list(),
      ]);
      setAnnouncements(ann);
      setBuildings(blds);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  }, [buildingId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <AppShell>
      <PageHeader
        title="Announcements"
        subtitle="Community news and updates"
        action={
          isAdmin ? (
            <Link href="/admin/announcements/new">
              <Button variant="primary" size="sm">
                + New
              </Button>
            </Link>
          ) : undefined
        }
      />

      {/* Building filter */}
      <div className="mb-6 flex gap-3 items-center">
        <label className="font-mono text-xs uppercase tracking-widest text-retro-muted">
          Filter:
        </label>
        <select
          value={buildingId}
          onChange={(e) => setBuildingId(e.target.value)}
          className="font-mono border-2 border-retro-dark bg-retro-cream px-3 py-2 text-sm text-retro-dark focus:outline-none focus:border-retro-green transition-colors"
        >
          <option value="">All Buildings</option>
          {buildings.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4">
          <AlertMessage type="error" message={error} onClose={() => setError("")} />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="border-4 border-retro-dark bg-retro-cream p-8 text-center shadow-[4px_4px_0_#000]">
          <div className="font-mono text-4xl mb-3">📭</div>
          <p className="font-mono text-sm text-retro-muted uppercase tracking-widest">
            No announcements yet
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <article
              key={a.id}
              className={`border-4 bg-retro-cream p-5 shadow-[4px_4px_0_#000] ${
                a.is_pinned ? "border-retro-yellow" : "border-retro-dark"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {a.is_pinned && <Badge variant="yellow">📌 Pinned</Badge>}
                  {a.building_id && buildingMap[a.building_id] && (
                    <Badge variant="blue">{buildingMap[a.building_id]}</Badge>
                  )}
                  {!a.building_id && <Badge variant="gray">All Buildings</Badge>}
                </div>
                {isAdmin && (
                  <Link
                    href={`/admin/announcements/${a.id}/edit`}
                    className="font-mono text-xs text-retro-green hover:underline flex-shrink-0"
                  >
                    Edit
                  </Link>
                )}
              </div>
              <h2 className="font-mono font-bold text-retro-dark text-base mb-2">
                {a.title}
              </h2>
              <p className="font-mono text-sm text-retro-dark whitespace-pre-wrap leading-relaxed">
                {a.body}
              </p>
              <div className="mt-3 font-mono text-xs text-retro-muted border-t-2 border-retro-dark pt-2">
                Posted: {new Date(a.created_at).toLocaleString()}
              </div>
            </article>
          ))}
        </div>
      )}
    </AppShell>
  );
}
