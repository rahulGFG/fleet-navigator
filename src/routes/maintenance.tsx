import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Plus, Pencil, Trash2, Search, Wrench, Calendar, DollarSign,
  FileText, Filter, X,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/tms/PageHeader";
import { EmptyState } from "@/components/tms/EmptyState";
import { ConfirmDelete } from "@/components/tms/ConfirmDelete";
import { FormField, IconInput } from "@/components/tms/FormField";
import { useMaintenance, useVehicles } from "@/hooks/use-tms";
import type { Maintenance } from "@/lib/tms-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/maintenance")({
  head: () => ({ meta: [{ title: "Maintenance — TMS" }] }),
  component: MaintenancePage,
});

const TYPES = ["Routine", "Repair", "Inspection", "Insurance", "Other"] as const;
const STATUSES = ["Scheduled", "In Progress", "Completed"] as const;

const empty: Omit<Maintenance, "id"> = {
  vehicleId: "",
  type: "Routine",
  description: "",
  cost: 0,
  date: "",
  nextDueDate: "",
  status: "Scheduled",
  notes: "",
};

function typeVariant(type: string) {
  if (type === "Repair") return "destructive";
  if (type === "Insurance") return "default";
  if (type === "Inspection") return "secondary";
  return "outline";
}

function statusVariant(status: string) {
  if (status === "Completed") return "default";
  if (status === "In Progress") return "secondary";
  return "outline";
}

function MaintenancePage() {
  const { items, loading, add, update, remove } = useMaintenance();
  const { items: vehicles } = useVehicles();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Maintenance | null>(null);
  const [form, setForm] = useState<Omit<Maintenance, "id">>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [toDelete, setToDelete] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter((m) => {
      const v = vehicles.find((x) => x.id === m.vehicleId);
      const matchQ =
        !q ||
        v?.plate.toLowerCase().includes(q) ||
        v?.model.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q) ||
        m.type.toLowerCase().includes(q);
      const matchType = filterType === "All" || m.type === filterType;
      const matchStatus = filterStatus === "All" || m.status === filterStatus;
      return matchQ && matchType && matchStatus;
    });
  }, [items, vehicles, query, filterType, filterStatus]);

  const hasFilters = query || filterType !== "All" || filterStatus !== "All";

  const vehicleLabel = (id: string) => {
    const v = vehicles.find((x) => x.id === id);
    return v ? `${v.plate} · ${v.model}` : "—";
  };

  const openCreate = () => {
    if (vehicles.length === 0) {
      toast.error("Add at least one vehicle first");
      return;
    }
    setEditing(null);
    setForm({ ...empty, vehicleId: vehicles[0]?.id ?? "", date: new Date().toISOString().slice(0, 10) });
    setErrors({});
    setOpen(true);
  };

  const openEdit = (m: Maintenance) => {
    setEditing(m);
    setForm({
      vehicleId: m.vehicleId,
      type: m.type,
      description: m.description,
      cost: m.cost,
      date: m.date,
      nextDueDate: m.nextDueDate,
      status: m.status,
      notes: m.notes,
    });
    setErrors({});
    setOpen(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.vehicleId) e.vehicleId = "Vehicle is required";
    if (!form.date) e.date = "Date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (editing) {
      update(editing.id, form);
      toast.success("Record updated");
    } else {
      add(form);
      toast.success("Maintenance record created");
    }
    setOpen(false);
  };

  const confirmDelete = () => {
    if (toDelete) {
      remove(toDelete);
      toast.success("Record deleted");
      setToDelete(null);
    }
  };

  // Total cost of filtered records
  const totalCost = filtered.reduce((sum, m) => sum + (m.cost || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Maintenance"
        description={`${items.length} record${items.length !== 1 ? "s" : ""} · Total cost: ₹${totalCost.toLocaleString()}`}
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> Add Record
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vehicle, type…"
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-44">
            <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Types</SelectItem>
            {TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Status</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setQuery(""); setFilterType("All"); setFilterStatus("All"); }}
            className="gap-1.5 text-muted-foreground"
          >
            <X className="h-3.5 w-3.5" /> Clear
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading…</div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No maintenance records"
          description="Track vehicle maintenance, repairs, and inspections here."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" /> Add Record
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Next Due</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{vehicleLabel(m.vehicleId)}</TableCell>
                    <TableCell>
                      <Badge variant={typeVariant(m.type)}>{m.type}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                      {m.description || "—"}
                    </TableCell>
                    <TableCell>{m.date}</TableCell>
                    <TableCell>{m.nextDueDate || "—"}</TableCell>
                    <TableCell>₹{(m.cost || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(m.status)}>{m.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(m)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setToDelete(m.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No records match your filters.
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
              {editing ? "Edit Record" : "Add Maintenance Record"}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {editing ? "Update maintenance details." : "Log a new maintenance event for a vehicle."}
            </p>
          </DialogHeader>
          <Separator />
          <form onSubmit={submit} className="space-y-5" noValidate>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Vehicle & Type
            </h3>
            <FormField label="Vehicle" required error={errors.vehicleId}>
              <Select
                value={form.vehicleId}
                onValueChange={(v) => setForm({ ...form, vehicleId: v })}
              >
                <SelectTrigger className={errors.vehicleId ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.plate} · {v.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="Type">
                <Select
                  value={form.type}
                  onValueChange={(v: Maintenance["type"]) => setForm({ ...form, type: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Status">
                <Select
                  value={form.status}
                  onValueChange={(v: Maintenance["status"]) => setForm({ ...form, status: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <Separator />
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Schedule & Cost
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="Date" required error={errors.date}>
                <IconInput
                  icon={Calendar}
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  invalid={!!errors.date}
                />
              </FormField>
              <FormField label="Next Due Date">
                <IconInput
                  icon={Calendar}
                  type="date"
                  value={form.nextDueDate}
                  onChange={(e) => setForm({ ...form, nextDueDate: e.target.value })}
                />
              </FormField>
            </div>
            <FormField label="Cost (₹)">
              <IconInput
                icon={DollarSign}
                type="number"
                min="0"
                value={form.cost.toString()}
                onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
                placeholder="0"
              />
            </FormField>

            <Separator />
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Notes
            </h3>
            <FormField label="Description">
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the maintenance work…"
                  className="pl-9 min-h-[80px]"
                  maxLength={500}
                />
              </div>
            </FormField>
            <FormField label="Internal Notes">
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Additional notes…"
                className="min-h-[60px]"
              />
            </FormField>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editing ? "Save Changes" : "Add Record"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDelete
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete record?"
        description="This will permanently remove this maintenance record."
      />
    </div>
  );
}
