import { useCallback, useEffect, useState } from "react";
import { storage, uid } from "@/lib/storage";
import type { Vehicle, Driver, Trip } from "@/lib/tms-types";

const KEYS = {
  vehicles: "tms.vehicles",
  drivers: "tms.drivers",
  trips: "tms.trips",
};

function useCollection<T extends { id: string }>(key: string, seed: T[] = []) {
  const [items, setItems] = useState<T[]>(seed);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setItems(storage.read<T[]>(key, seed));
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!loading) storage.write(key, items);
  }, [key, items, loading]);

  // Cross-tab / cross-page sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) setItems(storage.read<T[]>(key, seed));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const add = useCallback(
    (item: Omit<T, "id">) => {
      setItems((prev) => [...prev, { ...item, id: uid() } as T]);
    },
    [],
  );

  const update = useCallback((id: string, patch: Partial<T>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

  return { items, loading, add, update, remove };
}

export const useVehicles = () => useCollection<Vehicle>(KEYS.vehicles);
export const useDrivers = () => useCollection<Driver>(KEYS.drivers);
export const useTrips = () => useCollection<Trip>(KEYS.trips);