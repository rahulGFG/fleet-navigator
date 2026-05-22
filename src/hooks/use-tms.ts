import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth-context";
import type { Vehicle, Driver, Trip } from "@/lib/tms-types";

function useCollection<T extends { id: string }>(endpoint: string) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Don't fetch if there's no token — auth hasn't hydrated yet or user is logged out
    if (!getToken()) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    api
      .get<T[]>(endpoint)
      .then((data) => { if (!cancelled) setItems(data); })
      .catch(console.error)
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [endpoint]);

  const add = useCallback(
    async (item: Omit<T, "id">) => {
      const created = await api.post<T>(endpoint, item);
      setItems((prev) => [created, ...prev]);
      return created;
    },
    [endpoint]
  );

  const update = useCallback(
    async (id: string, patch: Partial<T>) => {
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, ...patch } : it))
      );
      try {
        const updated = await api.put<T>(`${endpoint}/${id}`, {
          ...items.find((it) => it.id === id),
          ...patch,
        });
        setItems((prev) => prev.map((it) => (it.id === id ? updated : it)));
        return updated;
      } catch (err) {
        api.get<T[]>(endpoint).then(setItems).catch(console.error);
        throw err;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [endpoint, items]
  );

  const remove = useCallback(
    async (id: string) => {
      setItems((prev) => prev.filter((it) => it.id !== id));
      try {
        await api.delete(`${endpoint}/${id}`);
      } catch (err) {
        api.get<T[]>(endpoint).then(setItems).catch(console.error);
        throw err;
      }
    },
    [endpoint]
  );

  return { items, loading, add, update, remove };
}

export const useVehicles = () => useCollection<Vehicle>("/vehicles");
export const useDrivers  = () => useCollection<Driver>("/drivers");
export const useTrips    = () => useCollection<Trip>("/trips");
