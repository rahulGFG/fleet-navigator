import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search, Users } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/tms/PageHeader";
import { EmptyState } from "@/components/tms/EmptyState";
import { ConfirmDelete } from "@/components/tms/ConfirmDelete";
import { useDrivers } from "@/hooks/use-tms";
import type { Driver } from "@/lib/tms-types";
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

export const Route = createFileRoute("/drivers")({
  head: () => ({ meta: [{ title: "Drivers — TMS" }] }),
  component: DriversPage,
});

const empty: Omit<Driver, "id"> = {
  name: "",
  license: "",
  phone: "",
  experience: "",
  status: "Available",
};

function DriversPage() {
  const { items, loading, add, update, remove } = useDrivers();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);
  const [form, setForm] = useState<Omit<Driver, "id">>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [toDelete, setToDelete] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.license.toLowerCase().includes(q) ||
        d.phone.toLowerCase().includes(q),
    );
  }, [items, query]);

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setErrors({});
    setOpen(true);
  };

  const openEdit = (d: Driver) => {
    setEditing(d);
    setForm({
      name: d.name,
      license: d.license,
      phone: d.phone,
      experience: d.experience,
      status: d.status,
    });
    setErrors({});
    setOpen(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.license.trim()) e.license = "License is required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (editing) {
      update(editing.id, form);
      toast.success("Driver updated");
    } else {
      add(form);
      toast.success("Driver added");
    }
    setOpen(false);
  };

  const confirmDelete = () => {
    if (toDelete) {
      remove(toDelete);
      toast.success("Driver deleted");
      setToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Drivers"
        description="Manage your driver roster"
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> Add Driver
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search drivers..."
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading…</div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No drivers yet"
          description="Add your first driver to start assigning trips."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" /> Add Driver
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>License</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell>{d.license}</TableCell>
                  <TableCell>{d.phone}</TableCell>
                  <TableCell>{d.experience}</TableCell>
                  <TableCell>
                    <Badge variant={d.status === "Available" ? "default" : "secondary"}>
                      {d.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(d)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setToDelete(d.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No drivers match your search.
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
            <DialogTitle>{editing ? "Edit Driver" : "Add Driver"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-2">
              <Label>Full Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe"
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>License No.</Label>
                <Input
                  value={form.license}
                  onChange={(e) => setForm({ ...form, license: e.target.value })}
                  placeholder="DL-1234567"
                />
                {errors.license && <p className="text-xs text-destructive">{errors.license}</p>}
              </div>
              <div className="grid gap-2">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 555 0100"
                />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Experience</Label>
                <Input
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  placeholder="5 years"
                />
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v: Driver["status"]) => setForm({ ...form, status: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="On Trip">On Trip</SelectItem>
                    <SelectItem value="Off Duty">Off Duty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
        title="Delete driver?"
        description="This will permanently remove this driver."
      />
    </div>
  );
}