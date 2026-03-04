"use client";

/**
 * Directory page – searchable resident directory with building filter.
 */
import { useEffect, useState, useCallback } from "react";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { directoryApi, buildingsApi, DirectoryResidentOut, BuildingOut } from "@/lib/api";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import AlertMessage from "@/components/ui/AlertMessage";

export default function DirectoryPage() {
  const [residents, setResidents] = useState<DirectoryResidentOut[]>([]);
  const [buildings, setBuildings] = useState<BuildingOut[]>([]);
  const [search, setSearch] = useState("");
  const [buildingId, setBuildingId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchBuildings = useCallback(async () => {
    try {
      const data = await buildingsApi.list();
      setBuildings(data);
    } catch {
      // Non-critical, ignore
    }
  }, []);

  const fetchResidents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params: { search?: string; building_id?: number } = {};
      if (search.trim()) params.search = search.trim();
      if (buildingId) params.building_id = Number(buildingId);
      const data = await directoryApi.search(params);
      setResidents(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load directory");
    } finally {
      setLoading(false);
    }
  }, [search, buildingId]);

  useEffect(() => {
    fetchBuildings();
    fetchResidents();
  }, [fetchBuildings, fetchResidents]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResidents();
  };

  return (
    <AppShell>
      <PageHeader title="Resident Directory" subtitle="Search residents by name or unit" />

      {/* Search & Filter */}
      <form onSubmit={handleSearchSubmit} className="mb-6 flex flex-col sm:flex-row gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or unit..."
          className="flex-1 font-mono border-2 border-retro-dark bg-retro-cream px-3 py-2 text-sm text-retro-dark placeholder:text-retro-muted focus:outline-none focus:border-retro-green transition-colors"
          aria-label="Search residents"
        />
        <select
          value={buildingId}
          onChange={(e) => setBuildingId(e.target.value)}
          className="font-mono border-2 border-retro-dark bg-retro-cream px-3 py-2 text-sm text-retro-dark focus:outline-none focus:border-retro-green transition-colors"
          aria-label="Filter by building"
        >
          <option value="">All Buildings</option>
          {buildings.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <Button type="submit" variant="primary" loading={loading}>
          ▶ Search
        </Button>
      </form>

      {error && (
        <div className="mb-4">
          <AlertMessage type="error" message={error} onClose={() => setError("")} />
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : residents.length === 0 ? (
        <div className="border-4 border-retro-dark bg-retro-cream p-8 text-center shadow-[4px_4px_0_#000]">
          <div className="font-mono text-4xl mb-3">◌</div>
          <p className="font-mono text-sm text-retro-muted uppercase tracking-widest">
            No residents found
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {residents.map((r) => (
            <ResidentCard key={r.id} resident={r} />
          ))}
        </div>
      )}

      <div className="mt-4 font-mono text-xs text-retro-muted">
        {residents.length} resident{residents.length !== 1 ? "s" : ""} found
      </div>
    </AppShell>
  );
}

function ResidentCard({ resident: r }: { resident: DirectoryResidentOut }) {
  const initials = `${r.first_name[0]}${r.last_name[0]}`.toUpperCase();

  return (
    <div className="border-4 border-retro-dark bg-retro-cream shadow-[4px_4px_0_#000] p-4 hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {r.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={r.photo_url}
              alt={`${r.first_name} ${r.last_name}`}
              className="h-14 w-14 border-2 border-retro-dark object-cover"
            />
          ) : (
            <div className="h-14 w-14 border-2 border-retro-dark bg-retro-green flex items-center justify-center font-mono font-bold text-retro-dark text-lg">
              {initials}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="font-mono font-bold text-retro-dark text-sm">
            {r.first_name} {r.last_name}
          </div>
          {r.building_name && (
            <div className="font-mono text-xs text-retro-muted mt-0.5">
              {r.building_name}
            </div>
          )}
          {r.unit_number && (
            <Badge variant="green">Unit {r.unit_number}</Badge>
          )}
          <div className="mt-2 space-y-0.5">
            {r.phone && (
              <div className="font-mono text-xs text-retro-dark">
                ☏ {r.phone}
              </div>
            )}
            {r.email && (
              <div className="font-mono text-xs text-retro-dark truncate">
                @ {r.email}
              </div>
            )}
            {!r.phone && !r.email && (
              <div className="font-mono text-xs text-retro-muted italic">
                Contact info hidden
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
