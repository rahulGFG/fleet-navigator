import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search, MapPin } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/tms/PageHeader";
import { EmptyState } from "@/components/tms/EmptyState";
import { ConfirmDelete } from "@/components/tms/ConfirmDelete";
import { useTrips, useVehicles, useDrivers } from "@/hooks/use-tms";
import type { Trip } from "@/lib/tms-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/trips")({
  head: () => ({ meta: [{ title: "Trips — TMS" }] }),
  component: TripsPage,
});

const empty: Omit<Trip, "id"> = {
  vehicleId: "",
  driverId: "",
  date: "",
  destination: "",
  origin: "",
  status: "Scheduled",
};

function TripsPage() {
  const { items: vehicles } = useVehicles();
  const { items: drivers } = useDrivers();
  const { items, loading, add, update, remove } = useTrips();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Trip | null>(null);
  const [form, setForm] = useState<Omit<Trip, "id">>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [toDelete, setToDelete] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter(
      (t) =>
        t.destination.toLowerCase().includes(q) ||
        t.origin.toLowerCase().includes(q) ||
        t.date.toLowerCase().includes(q),
    );
  }, [items, query]);

  const vehicleName = (id: string) => {
    const v = vehicles.find((x) => x.id === id);
    return v ? `${v.plate} · ${v.model}` : "—";
  };
  const driverName = (id: string) => drivers.find((x) => x.id === id)?.name ?? "—";

  const openCreate = () => {
    if (vehicles.length === 0 || drivers.length === 0) {
      toast.error("Add at least one vehicle and one driver first");
      return;
    }
    setEditing(null);
    setForm({ ...empty, date: new Date().toISOString().slice(0, 10) });
    setErrors({});
    setOpen(true);
  };

  const openEdit = (t: Trip) => {
    setEditing(t);
    setForm({
      vehicleId: t.vehicleId,
      driverId: t.driverId,
      date: t.date,
      destination: t.destination,
      origin: t.origin,
      status: t.status,
    });
    setErrors({});
    setOpen(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.vehicleId) e.vehicleId = "Select a vehicle";
    if (!form.driverId) e.driverId = "Select a driver";
    if (!form.date) e.date = "Date is required";
    if (!form.destination.trim()) e.destination = "Destination is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (editing) {
      update(editing.id, form);
      toast.success("Trip updated");
    } else {
      add(form);
      toast.success("Trip created");
    }
    setOpen(false);
  };

  const confirmDelete = () => {
    if (toDelete) {
      remove(toDelete);
      toast.success("Trip deleted");
      setToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Trips"
        description="Schedule and track trips"
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> New Trip
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search trips..."
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading…</div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No trips yet"
          description="Create your first trip by selecting a vehicle, driver, and destination."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" /> New Trip
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Origin</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.date}</TableCell>
                    <TableCell>{vehicleName(t.vehicleId)}</TableCell>
                    <TableCell>{driverName(t.driverId)}</TableCell>
                    <TableCell>{t.origin || "—"}</TableCell>
                    <TableCell className="font-medium">{t.destination}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          t.status === "Completed"
                            ? "default"
                            : t.status === "Cancelled"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(t)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setToDelete(t.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No trips match your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Trip" : "New Trip"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-2">
              <Label>Vehicle</Label>
              <Select
                value={form.vehicleId}
                onValueChange={(v) => setForm({ ...form, vehicleId: v })}
              >
                <SelectTrigger><SelectValue placeholder="Select a vehicle" /></SelectTrigger>
                <SelectContent>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.plate} · {v.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vehicleId && <p className="text-xs text-destructive">{errors.vehicleId}</p>}
            </div>
            <div className="grid gap-2">
              <Label>Driver</Label>
              <Select
                value={form.driverId}
                onValueChange={(v) => setForm({ ...form, driverId: v })}
              >
                <SelectTrigger><SelectValue placeholder="Select a driver" /></SelectTrigger>
                <SelectContent>
                  {drivers.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.driverId && <p className="text-xs text-destructive">{errors.driverId}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
                {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v: Trip["status"]) => setForm({ ...form, status: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Origin</Label>
              <Input
                value={form.origin}
                onChange={(e) => setForm({ ...form, origin: e.target.value })}
                placeholder="Warehouse A"
              />
            </div>
            <div className="grid gap-2">
              <Label>Destination</Label>
              <Input
                value={form.destination}
                onChange={(e) => setForm({ ...form, destination: e.target.value })}
                placeholder="Customer site"
              />
              {errors.destination && (
                <p className="text-xs text-destructive">{errors.destination}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editing ? "Save" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDelete
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete trip?"
        description="This will permanently remove this trip."
      />
    </div>
  );
}