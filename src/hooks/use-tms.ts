import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth-context";
import type { Vehicle, Driver, Trip, TmsRoute, Booking, Maintenance, Notification, DashboardStats } from "@/lib/tms-types";

function useCollection<T extends { id: string }>(endpoint: string) {
  const [items, setItems]   = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(() => {
    if (!getToken()) { setLoading(false); return; }
    setLoading(true);
    api.get<T[]>(endpoint)
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [endpoint]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const add = useCallback(async (item: Omit<T, "id">) => {
    const created = await api.post<T>(endpoint, item);
    setItems((prev) => [created, ...prev]);
    return created;
  }, [endpoint]);

  const update = useCallback(async (id: string, patch: Partial<T>) => {
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, ...patch } : it));
    try {
      const full = await api.get<T>(`${endpoint}/${id}`);
      const merged = { ...full, ...patch };
      const updated = await api.put<T>(`${endpoint}/${id}`, merged);
      setItems((prev) => prev.map((it) => it.id === id ? updated : it));
      return updated;
    } catch (err) {
      fetchAll();
      throw err;
    }
  }, [endpoint, fetchAll]);

  const remove = useCallback(async (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    try {
      await api.delete(`${endpoint}/${id}`);
    } catch (err) {
      fetchAll();
      throw err;
    }
  }, [endpoint, fetchAll]);

  return { items, loading, add, update, remove, refetch: fetchAll };
}

export const useVehicles     = () => useCollection<Vehicle>("/vehicles");
export const useDrivers      = () => useCollection<Driver>("/drivers");
export const useTrips        = () => useCollection<Trip>("/trips");
export const useRoutes       = () => useCollection<TmsRoute>("/routes");
export const useBookings     = () => useCollection<Booking>("/bookings");
export const useMaintenance  = () => useCollection<Maintenance>("/maintenance");

// ── Dashboard analytics ───────────────────────────────────────────────────────
export function useDashboardStats() {
  const [stats, setStats]   = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) { setLoading(false); return; }
    api.get<DashboardStats>("/analytics/dashboard")
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading };
}

// ── Notifications ─────────────────────────────────────────────────────────────
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);

  const fetch = useCallback(() => {
    if (!getToken()) return;
    api.get<Notification[]>("/notifications").then(setNotifications).catch(console.error);
    api.get<{ count: number }>("/notifications/unread-count").then((r) => setUnread(r.count)).catch(console.error);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const markAllRead = async () => {
    await api.patch("/notifications/mark-all-read", {});
    setUnread(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return { notifications, unread, markAllRead, refetch: fetch };
}
