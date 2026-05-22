import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Plus, Pencil, Trash2, Search, Route as RouteIcon, MapPin, Navigation,
  Ruler, Clock, X, ToggleLeft, ToggleRight,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/tms/PageHeader";
import { EmptyState } from "@/components/tms/EmptyState";
import { ConfirmDelete } from "@/components/tms/ConfirmDelete";
import { FormField, IconInput } from "@/components/tms/FormField";
import { useRoutes } from "@/hooks/use-tms";
import type { TmsRoute } from "@/lib/tms-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/routes")({
  head: () => ({ meta: [{ title: "Routes — TMS" }] }),
  component: RoutesPage,
});

const empty: Omit<TmsRoute, "id"> = {
  name: "",
  origin: "",
  destination: "",
  distanceKm: 0,
  durationMin: 0,
  stops: [],
  isActive: true,
};

function RoutesPage() {
  const { items, loading, add, update, remove } = useRoutes();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TmsRoute | null>(null);
  const [form, setForm] = useState<Omit<TmsRoute, "id">>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [toDelete, setToDelete] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.origin.toLowerCase().includes(q) ||
        r.destination.toLowerCase().includes(q),
    );
  }, [items, query]);

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setErrors({});
    setOpen(true);
  };

  const openEdit = (r: TmsRoute) => {
    setEditing(r);
    setForm({
      name: r.name,
      origin: r.origin,
      destination: r.destination,
      distanceKm: r.distanceKm,
      durationMin: r.durationMin,
      stops: r.stops,
      isActive: r.isActive,
    });
    setErrors({});
    setOpen(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Route name is required";
    if (!form.origin.trim()) e.origin = "Origin is required";
    if (!form.destination.trim()) e.destination = "Destination is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (editing) {
      update(editing.id, form);
      toast.success("Route updated");
    } else {
      add(form);
      toast.success("Route created");
    }
    setOpen(false);
  };

  const confirmDelete = () => {
    if (toDelete) {
      remove(toDelete);
      toast.success("Route deleted");
      setToDelete(null);
    }
  };

  const toggleActive = async (r: TmsRoute) => {
    await update(r.id, { isActive: !r.isActive });
    toast.success(r.isActive ? "Route deactivated" : "Route activated");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Routes"
        description={`${items.length} route${items.length !== 1 ? "s" : ""} configured`}
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> New Route
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search routes…"
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading…</div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={RouteIcon}
          title="No routes yet"
          description="Create your first route to start assigning trips."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" /> New Route
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Origin</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Stops</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>{r.origin}</TableCell>
                    <TableCell>{r.destination}</TableCell>
                    <TableCell>
                      {r.distanceKm > 0 ? `${r.distanceKm} km` : "—"}
                    </TableCell>
                    <TableCell>
                      {r.durationMin > 0 ? `${r.durationMin} min` : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{r.stops?.length ?? 0}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.isActive ? "default" : "secondary"}>
                        {r.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleActive(r)}
                        title={r.isActive ? "Deactivate" : "Activate"}
                      >
                        {r.isActive ? (
                          <ToggleRight className="h-4 w-4 text-primary" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(r)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setToDelete(r.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No routes match your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl">
              {editing ? "Edit Route" : "Create New Route"}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {editing ? "Update route details below." : "Define a new transport route."}
            </p>
          </DialogHeader>
          <Separator />
          <form onSubmit={submit} className="space-y-5" noValidate>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Route Info
            </h3>
            <FormField label="Route Name" required error={errors.name}>
              <IconInput
                icon={RouteIcon}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Mumbai–Pune Express"
                maxLength={120}
                invalid={!!errors.name}
                autoFocus
              />
            </FormField>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="Origin" required error={errors.origin}>
                <IconInput
                  icon={Navigation}
                  value={form.origin}
                  onChange={(e) => setForm({ ...form, origin: e.target.value })}
                  placeholder="Mumbai"
                  invalid={!!errors.origin}
                />
              </FormField>
              <FormField label="Destination" required error={errors.destination}>
                <IconInput
                  icon={MapPin}
                  value={form.destination}
                  onChange={(e) => setForm({ ...form, destination: e.target.value })}
                  placeholder="Pune"
                  invalid={!!errors.destination}
                />
              </FormField>
            </div>

            <Separator />
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Distance & Time
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="Distance (km)">
                <IconInput
                  icon={Ruler}
                  type="number"
                  min="0"
                  value={form.distanceKm.toString()}
                  onChange={(e) => setForm({ ...form, distanceKm: Number(e.target.value) })}
                  placeholder="150"
                />
              </FormField>
              <FormField label="Duration (min)">
                <IconInput
                  icon={Clock}
                  type="number"
                  min="0"
                  value={form.durationMin.toString()}
                  onChange={(e) => setForm({ ...form, durationMin: Number(e.target.value) })}
                  placeholder="180"
                />
              </FormField>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="isActive"
                checked={form.isActive}
                onCheckedChange={(v) => setForm({ ...form, isActive: v })}
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Route is active
              </Label>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editing ? "Save Changes" : "Create Route"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDelete
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete route?"
        description="This will permanently remove this route."
      />
    </div>
  );
}
