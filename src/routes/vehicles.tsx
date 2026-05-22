import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search, Truck } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/tms/PageHeader";
import { EmptyState } from "@/components/tms/EmptyState";
import { ConfirmDelete } from "@/components/tms/ConfirmDelete";
import { useVehicles } from "@/hooks/use-tms";
import type { Vehicle } from "@/lib/tms-types";
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

export const Route = createFileRoute("/vehicles")({
  head: () => ({
    meta: [{ title: "Vehicles — TMS" }],
  }),
  component: VehiclesPage,
});

const empty: Omit<Vehicle, "id"> = {
  plate: "",
  model: "",
  type: "Truck",
  capacity: "",
  status: "Active",
};

function VehiclesPage() {
  const { items, loading, add, update, remove } = useVehicles();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [form, setForm] = useState<Omit<Vehicle, "id">>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [toDelete, setToDelete] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter(
      (v) =>
        v.plate.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.type.toLowerCase().includes(q),
    );
  }, [items, query]);

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
        description="Manage your fleet"
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> Add Vehicle
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search vehicles..."
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

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
                  <TableCell className="font-medium">{v.plate}</TableCell>
                  <TableCell>{v.model}</TableCell>
                  <TableCell>{v.type}</TableCell>
                  <TableCell>{v.capacity}</TableCell>
                  <TableCell>
                    <Badge variant={v.status === "Active" ? "default" : "secondary"}>
                      {v.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(v)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setToDelete(v.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No vehicles match your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Vehicle" : "Add Vehicle"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-2">
              <Label>Plate Number</Label>
              <Input
                value={form.plate}
                onChange={(e) => setForm({ ...form, plate: e.target.value })}
                placeholder="ABC-1234"
              />
              {errors.plate && <p className="text-xs text-destructive">{errors.plate}</p>}
            </div>
            <div className="grid gap-2">
              <Label>Model</Label>
              <Input
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                placeholder="Volvo FH16"
              />
              {errors.model && <p className="text-xs text-destructive">{errors.model}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Truck">Truck</SelectItem>
                    <SelectItem value="Van">Van</SelectItem>
                    <SelectItem value="Trailer">Trailer</SelectItem>
                    <SelectItem value="Pickup">Pickup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Capacity</Label>
                <Input
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  placeholder="20 tons"
                />
                {errors.capacity && <p className="text-xs text-destructive">{errors.capacity}</p>}
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
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
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editing ? "Save" : "Add"}</Button>
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