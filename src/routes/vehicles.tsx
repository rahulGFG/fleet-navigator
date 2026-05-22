import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search, Truck, Hash, Package, X, Filter } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/tms/PageHeader";
import { EmptyState } from "@/components/tms/EmptyState";
import { ConfirmDelete } from "@/components/tms/ConfirmDelete";
import { useVehicles } from "@/hooks/use-tms";
import type { Vehicle } from "@/lib/tms-types";
import { VEHICLE_TYPES } from "@/lib/tms-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FormField, IconInput } from "@/components/tms/FormField";
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

export const Route = createFileRoute("/vehicles")({
  head: () => ({ meta: [{ title: "Vehicles — TMS" }] }),
  component: VehiclesPage,
});

const empty: Omit<Vehicle, "id"> = {
  plate: "",
  model: "",
  type: "Truck",
  capacity: "",
  status: "Active",
};

const STATUS_OPTIONS = ["All", "Active", "Maintenance", "Inactive"] as const;

function statusVariant(status: string) {
  if (status === "Active") return "default";
  if (status === "Maintenance") return "secondary";
  return "outline";
}

function VehiclesPage() {
  const { items, loading, add, update, remove } = useVehicles();

  // ── Form state ──────────────────────────────────────────────────────────────
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [form, setForm] = useState<Omit<Vehicle, "id">>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toDelete, setToDelete] = useState<string | null>(null);

  // ── Filter state ────────────────────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  // ── Filtered list ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return items.filter((v) => {
      const matchesQuery =
        !q ||
        v.plate.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.type.toLowerCase().includes(q) ||
        v.capacity.toLowerCase().includes(q);
      const matchesType = filterType === "All" || v.type === filterType;
      const matchesStatus = filterStatus === "All" || v.status === filterStatus;
      return matchesQuery && matchesType && matchesStatus;
    });
  }, [items, query, filterType, filterStatus]);

  const hasActiveFilters = query || filterType !== "All" || filterStatus !== "All";

  const clearFilters = () => {
    setQuery("");
    setFilterType("All");
    setFilterStatus("All");
  };

  // ── CRUD handlers ───────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setErrors({});
    setOpen(true);
  };

  const openEdit = (v: Vehicle) => {
    setEditing(v);
    setForm({ plate: v.plate, model: v.model, type: v.type, capacity: v.capacity, status: v.status });
    setErrors({});
    setOpen(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.plate.trim()) e.plate = "Plate is required";
    if (!form.model.trim()) e.model = "Model is required";
    if (!form.capacity.trim()) e.capacity = "Capacity is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (editing) {
      update(editing.id, form);
      toast.success("Vehicle updated");
    } else {
      add(form);
      toast.success("Vehicle added");
    }
    setOpen(false);
  };

  const confirmDelete = () => {
    if (toDelete) {
      remove(toDelete);
      toast.success("Vehicle deleted");
      setToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Vehicles"
        description={`${items.length} vehicle${items.length !== 1 ? "s" : ""} in fleet`}
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> Add Vehicle
          </Button>
        }
      />

      {/* ── Search & Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Text search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search plate, model, type…"
            className="pl-9 pr-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Type filter */}
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-44">
            <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent className="max-h-64">
            <SelectItem value="All">All Types</SelectItem>
            {VEHICLE_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status filter */}
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>{s === "All" ? "All Status" : s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5 text-muted-foreground">
            <X className="h-3.5 w-3.5" /> Clear
          </Button>
        )}
      </div>

      {/* ── Results summary ─────────────────────────────────────────────────── */}
      {hasActiveFilters && !loading && (
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filtered.length}</span> of {items.length} vehicles
        </p>
      )}

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading…</div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="No vehicles yet"
          description="Add your first vehicle to start managing your fleet."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" /> Add Vehicle
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plate</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-mono font-medium">{v.plate}</TableCell>
                    <TableCell>{v.model}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{v.type}</Badge>
                    </TableCell>
                    <TableCell>{v.capacity}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(v.status)}>{v.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(v)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setToDelete(v.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                      No vehicles match your filters.{" "}
                      <button onClick={clearFilters} className="text-primary underline underline-offset-2">
                        Clear filters
                      </button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* ── Add / Edit Dialog ───────────────────────────────────────────────── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl">
              {editing ? "Edit Vehicle" : "Add New Vehicle"}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {editing
                ? "Update the vehicle's information below."
                : "Register a new vehicle. Fields marked * are required."}
            </p>
          </DialogHeader>
          <Separator />
          <form onSubmit={submit} className="space-y-5" noValidate>
            {/* Identification */}
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Identification
            </h3>
            <FormField label="Plate Number" required error={errors.plate}>
              <IconInput
                icon={Hash}
                value={form.plate}
                onChange={(e) => setForm({ ...form, plate: e.target.value.toUpperCase() })}
                placeholder="MH-12-AB-1234"
                maxLength={20}
                invalid={!!errors.plate}
                autoFocus
              />
            </FormField>
            <FormField label="Model" required error={errors.model}>
              <IconInput
                icon={Truck}
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                placeholder="Tata Prima 4928.S"
                maxLength={80}
                invalid={!!errors.model}
              />
            </FormField>

            <Separator />
            {/* Specifications */}
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Specifications
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="Type">
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-64">
                    {VEHICLE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField
                label="Capacity"
                required
                error={errors.capacity}
                hint={!errors.capacity ? "e.g. 20 tons, 50 seats" : undefined}
              >
                <IconInput
                  icon={Package}
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  placeholder="20 tons"
                  maxLength={30}
                  invalid={!!errors.capacity}
                />
              </FormField>
            </div>
            <FormField label="Status">
              <Select
                value={form.status}
                onValueChange={(v: Vehicle["status"]) => setForm({ ...form, status: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editing ? "Save Changes" : "Add Vehicle"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDelete
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete vehicle?"
        description="This will permanently remove the vehicle from your fleet."
      />
    </div>
  );
}
