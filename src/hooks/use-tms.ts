import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Vehicle, Driver, Trip } from "@/lib/tms-types";

// Generic hook that talks to a REST endpoint.
// Keeps the same interface as the old localStorage hook:
//   { items, loading, add, update, remove }
function useCollection<T extends { id: string }>(endpoint: string) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all on mount
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get<T[]>(endpoint)
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [endpoint]);

  // Create — POST, then prepend to local state
  const add = useCallback(
    async (item: Omit<T, "id">) => {
      const created = await api.post<T>(endpoint, item);
      setItems((prev) => [created, ...prev]);
      return created;
    },
    [endpoint]
  );

  // Update — PUT, then patch local state
  const update = useCallback(
    async (id: string, patch: Partial<T>) => {
      // Optimistically find the full current item and merge
      setItems((prev) => {
        const current = prev.find((it) => it.id === id);
        if (!current) return prev;
        return prev.map((it) => (it.id === id ? { ...it, ...patch } : it));
      });
      try {
        const updated = await api.put<T>(`${endpoint}/${id}`, {
          ...items.find((it) => it.id === id),
          ...patch,
        });
        setItems((prev) => prev.map((it) => (it.id === id ? updated : it)));
        return updated;
      } catch (err) {
        // Revert on failure by re-fetching
        api.get<T[]>(endpoint).then(setItems).catch(console.error);
        throw err;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [endpoint, items]
  );

  // Delete — DELETE, then remove from local state
  const remove = useCallback(
    async (id: string) => {
      setItems((prev) => prev.filter((it) => it.id !== id));
      try {
        await api.delete(`${endpoint}/${id}`);
      } catch (err) {
        // Revert on failure
        api.get<T[]>(endpoint).then(setItems).catch(console.error);
        throw err;
      }
    },
    [endpoint]
  );

  return { items, loading, add, update, remove };
}

export const useVehicles = () => useCollection<Vehicle>("/vehicles");
export const useDrivers = () => useCollection<Driver>("/drivers");
export const useTrips = () => useCollection<Trip>("/trips");
