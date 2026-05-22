import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Plus, Search, CreditCard, Filter, X, TrendingUp, IndianRupee,
  CheckCircle2, Clock,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/tms/PageHeader";
import { EmptyState } from "@/components/tms/EmptyState";
import { FormField } from "@/components/tms/FormField";
import { StatCard } from "@/components/tms/StatCard";
import { useBookings } from "@/hooks/use-tms";
import type { Payment } from "@/lib/tms-types";
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
import { useCallback, useEffect } from "react";
import { getToken } from "@/lib/auth-context";

export const Route = createFileRoute("/payments")({
  head: () => ({ meta: [{ title: "Payments — TMS" }] }),
  component: PaymentsPage,
});

const METHODS = ["Cash", "Online", "Card", "UPI"] as const;
const STATUS_OPTIONS = ["All", "Success", "Pending", "Failed", "Refunded"] as const;

function statusVariant(status: string) {
  if (status === "Success") return "default";
  if (status === "Failed") return "destructive";
  if (status === "Refunded") return "secondary";
  return "outline";
}

function methodVariant(method: string) {
  if (method === "UPI") return "default";
  if (method === "Card") return "secondary";
  return "outline";
}

function usePayments() {
  const [items, setItems] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ total: number; revenue: number } | null>(null);

  const fetchAll = useCallback(() => {
    if (!getToken()) { setLoading(false); return; }
    setLoading(true);
    Promise.all([
      api.get<Payment[]>("/payments"),
      api.get<{ total: number; revenue: number }>("/payments/stats"),
    ])
      .then(([payments, s]) => { setItems(payments); setStats(s); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return { items, loading, stats, refetch: fetchAll };
}

function PaymentsPage() {
  const { items, loading, stats, refetch } = usePayments();
  const { items: bookings } = useBookings();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ bookingId: "", amount: 0, method: "Cash" as Payment["method"] });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter((p) => {
      const matchQ =
        !q ||
        p.transactionId?.toLowerCase().includes(q) ||
        p.method?.toLowerCase().includes(q);
      const matchStatus = filterStatus === "All" || p.status === filterStatus;
      return matchQ && matchStatus;
    });
  }, [items, query, filterStatus]);

  const hasFilters = query || filterStatus !== "All";

  const unpaidBookings = bookings.filter((b) => b.paymentStatus === "Unpaid" && b.status !== "Cancelled");

  const openCreate = () => {
    if (unpaidBookings.length === 0) {
      toast.error("No unpaid bookings found");
      return;
    }
    setForm({ bookingId: unpaidBookings[0]?.id ?? "", amount: unpaidBookings[0]?.fare ?? 0, method: "Cash" });
    setErrors({});
    setOpen(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.bookingId) e.bookingId = "Booking is required";
    if (form.amount <= 0) e.amount = "Amount must be positive";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await api.post("/payments", form);
      toast.success("Payment recorded");
      setOpen(false);
      refetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Payment failed");
    }
  };

  const bookingLabel = (id: string) => {
    const b = bookings.find((x) => x.id === id);
    return b ? `${b.bookingRef} — ${b.passengerName} (₹${b.fare})` : id;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Payments"
        description="Track and record passenger payments"
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> Record Payment
          </Button>
        }
      />

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Transactions"
            value={stats.total}
            icon={CreditCard}
            hint="Successful"
          />
          <StatCard
            label="Total Revenue"
            value={`₹${stats.revenue.toLocaleString()}`}
            icon={IndianRupee}
            hint="All time"
          />
          <StatCard
            label="Unpaid Bookings"
            value={unpaidBookings.length}
            icon={Clock}
            hint="Pending payment"
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transaction ID, method…"
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
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setQuery(""); setFilterStatus("All"); }}
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
          icon={CreditCard}
          title="No payments yet"
          description="Record a payment against a confirmed booking."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" /> Record Payment
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Booking</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Paid At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">
                      {p.transactionId || p.id.slice(-8).toUpperCase()}
                    </TableCell>
                    <TableCell className="text-sm">{bookingLabel(p.bookingId)}</TableCell>
                    <TableCell className="font-medium">₹{p.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={methodVariant(p.method)}>{p.method}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(p.status)}>{p.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.paidAt ? new Date(p.paidAt).toLocaleDateString() : "—"}
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No payments match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Record Payment Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl">Record Payment</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Mark a booking as paid and record the payment method.
            </p>
          </DialogHeader>
          <Separator />
          <form onSubmit={submit} className="space-y-5" noValidate>
            <FormField label="Booking" required error={errors.bookingId}>
              <Select
                value={form.bookingId}
                onValueChange={(v) => {
                  const b = bookings.find((x) => x.id === v);
                  setForm({ ...form, bookingId: v, amount: b?.fare ?? 0 });
                }}
              >
                <SelectTrigger className={errors.bookingId ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select unpaid booking" />
                </SelectTrigger>
                <SelectContent>
                  {unpaidBookings.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.bookingRef} — {b.passengerName} (₹{b.fare})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Amount (₹)" required error={errors.amount}>
                <Input
                  type="number"
                  min="1"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                  className={errors.amount ? "border-destructive" : ""}
                />
              </FormField>
              <FormField label="Method">
                <Select
                  value={form.method}
                  onValueChange={(v: Payment["method"]) => setForm({ ...form, method: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <CheckCircle2 className="h-4 w-4 mr-2" /> Confirm Payment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
