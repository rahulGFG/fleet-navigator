import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Plus, Search, Ticket, User, Phone, Mail, Hash,
  X, Filter, Ban, CheckCircle2, Clock,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/tms/PageHeader";
import { EmptyState } from "@/components/tms/EmptyState";
import { ConfirmDelete } from "@/components/tms/ConfirmDelete";
import { FormField, IconInput } from "@/components/tms/FormField";
import { useBookings, useTrips } from "@/hooks/use-tms";
import type { Booking } from "@/lib/tms-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { api } from "@/lib/api";

export const Route = createFileRoute("/bookings")({
  head: () => ({ meta: [{ title: "Bookings — TMS" }] }),
  component: BookingsPage,
});

const empty = {
  tripId: "",
  seatNumber: 1,
  passengerName: "",
  passengerPhone: "",
  passengerEmail: "",
  fare: 0,
};

const STATUS_OPTIONS = ["All", "Confirmed", "Pending", "Cancelled", "Completed"] as const;
const PAYMENT_OPTIONS = ["All", "Unpaid", "Paid", "Refunded"] as const;

function statusVariant(status: string) {
  if (status === "Confirmed") return "default";
  if (status === "Completed") return "default";
  if (status === "Cancelled") return "destructive";
  return "secondary";
}

function paymentVariant(status: string) {
  if (status === "Paid") return "default";
  if (status === "Refunded") return "secondary";
  return "outline";
}

function BookingsPage() {
  const { items, loading, add, refetch } = useBookings();
  const { items: trips } = useTrips();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPayment, setFilterPayment] = useState("All");
  const [toCancel, setToCancel] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter((b) => {
      const matchQ =
        !q ||
        b.bookingRef?.toLowerCase().includes(q) ||
        b.passengerName?.toLowerCase().includes(q) ||
        b.passengerEmail?.toLowerCase().includes(q) ||
        b.passengerPhone?.toLowerCase().includes(q);
      const matchStatus = filterStatus === "All" || b.status === filterStatus;
      const matchPayment = filterPayment === "All" || b.paymentStatus === filterPayment;
      return matchQ && matchStatus && matchPayment;
    });
  }, [items, query, filterStatus, filterPayment]);

  const hasFilters = query || filterStatus !== "All" || filterPayment !== "All";

  const tripLabel = (id: string) => {
    const t = trips.find((x) => x.id === id);
    return t ? `${t.origin || "?"} → ${t.destination} (${t.date})` : id;
  };

  const openCreate = () => {
    if (trips.length === 0) {
      toast.error("Create at least one trip first");
      return;
    }
    setForm({ ...empty, tripId: trips[0]?.id ?? "" });
    setErrors({});
    setOpen(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.tripId) e.tripId = "Trip is required";
    if (!form.passengerName.trim()) e.passengerName = "Passenger name is required";
    if (form.seatNumber < 1) e.seatNumber = "Valid seat number required";
    if (form.fare < 0) e.fare = "Fare must be positive";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await add(form as Omit<Booking, "id">);
      toast.success("Booking created");
      setOpen(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create booking");
    }
  };

  const confirmCancel = async () => {
    if (!toCancel) return;
    try {
      await api.patch(`/bookings/${toCancel}/cancel`, {});
      toast.success("Booking cancelled");
      refetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel");
    } finally {
      setToCancel(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Bookings"
        description={`${items.length} booking${items.length !== 1 ? "s" : ""} total`}
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> New Booking
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search ref, name, email…"
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-44">
            <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>{s === "All" ? "All Status" : s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterPayment} onValueChange={setFilterPayment}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All Payments" />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>{s === "All" ? "All Payments" : s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setQuery(""); setFilterStatus("All"); setFilterPayment("All"); }}
            className="gap-1.5 text-muted-foreground"
          >
            <X className="h-3.5 w-3.5" /> Clear
          </Button>
        )}
      </div>

      {hasFilters && !loading && (
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filtered.length}</span> of {items.length} bookings
        </p>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading…</div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No bookings yet"
          description="Create your first booking by selecting a trip and passenger details."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" /> New Booking
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ref</TableHead>
                  <TableHead>Passenger</TableHead>
                  <TableHead>Trip</TableHead>
                  <TableHead>Seat</TableHead>
                  <TableHead>Fare</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-xs font-medium">{b.bookingRef}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{b.passengerName}</p>
                        <p className="text-xs text-muted-foreground">{b.passengerPhone}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{tripLabel(b.tripId)}</TableCell>
                    <TableCell>{b.seatNumber}</TableCell>
                    <TableCell>₹{b.fare}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(b.status)}>{b.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={paymentVariant(b.paymentStatus)}>{b.paymentStatus}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {b.status !== "Cancelled" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setToCancel(b.id)}
                          title="Cancel booking"
                        >
                          <Ban className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No bookings match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Create Booking Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl">New Booking</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Book a seat for a passenger on a scheduled trip.
            </p>
          </DialogHeader>
          <Separator />
          <form onSubmit={submit} className="space-y-5" noValidate>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Trip & Seat
            </h3>
            <FormField label="Trip" required error={errors.tripId}>
              <Select
                value={form.tripId}
                onValueChange={(v) => setForm({ ...form, tripId: v })}
              >
                <SelectTrigger className={errors.tripId ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select a trip" />
                </SelectTrigger>
                <SelectContent>
                  {trips
                    .filter((t) => t.status === "Scheduled" || t.status === "In Progress")
                    .map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.origin || "?"} → {t.destination} ({t.date})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </FormField>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="Seat Number" required error={errors.seatNumber}>
                <IconInput
                  icon={Hash}
                  type="number"
                  min="1"
                  value={form.seatNumber.toString()}
                  onChange={(e) => setForm({ ...form, seatNumber: Number(e.target.value) })}
                  invalid={!!errors.seatNumber}
                />
              </FormField>
              <FormField label="Fare (₹)" error={errors.fare}>
                <IconInput
                  icon={CheckCircle2}
                  type="number"
                  min="0"
                  value={form.fare.toString()}
                  onChange={(e) => setForm({ ...form, fare: Number(e.target.value) })}
                  placeholder="0"
                />
              </FormField>
            </div>

            <Separator />
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Passenger Details
            </h3>
            <FormField label="Full Name" required error={errors.passengerName}>
              <IconInput
                icon={User}
                value={form.passengerName}
                onChange={(e) => setForm({ ...form, passengerName: e.target.value })}
                placeholder="John Doe"
                invalid={!!errors.passengerName}
                autoFocus
              />
            </FormField>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="Phone">
                <IconInput
                  icon={Phone}
                  type="tel"
                  value={form.passengerPhone}
                  onChange={(e) => setForm({ ...form, passengerPhone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </FormField>
              <FormField label="Email">
                <IconInput
                  icon={Mail}
                  type="email"
                  value={form.passengerEmail}
                  onChange={(e) => setForm({ ...form, passengerEmail: e.target.value })}
                  placeholder="john@example.com"
                />
              </FormField>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Ticket className="h-4 w-4 mr-2" /> Create Booking
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDelete
        open={!!toCancel}
        onOpenChange={(o) => !o && setToCancel(null)}
        onConfirm={confirmCancel}
        title="Cancel booking?"
        description="This will mark the booking as cancelled. This action cannot be undone."
      />
    </div>
  );
}
