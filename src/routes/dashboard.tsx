import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Truck, Users, MapPin, Activity, IndianRupee, Ticket,
  TrendingUp, ArrowRight, Loader2,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { StatCard } from "@/components/tms/StatCard";
import { PageHeader } from "@/components/tms/PageHeader";
import { useDashboardStats, useTrips, useVehicles, useDrivers } from "@/hooks/use-tms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Transport Management" },
      { name: "description", content: "Overview of fleet, drivers, and trips." },
    ],
  }),
  component: DashboardPage,
});

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const TRIP_STATUS_COLORS: Record<string, string> = {
  "Scheduled":   "hsl(var(--chart-2))",
  "In Progress": "hsl(var(--chart-1))",
  "Completed":   "hsl(var(--chart-3))",
  "Cancelled":   "hsl(var(--destructive))",
};

function tripStatusVariant(status: string) {
  if (status === "Completed") return "default";
  if (status === "Cancelled") return "destructive";
  if (status === "In Progress") return "secondary";
  return "outline";
}

function DashboardPage() {
  const { stats, loading: statsLoading } = useDashboardStats();
  const { items: vehicles } = useVehicles();
  const { items: drivers } = useDrivers();
  const { items: trips } = useTrips();

  const recentTrips = [...trips].slice(0, 6);

  // Fallback summary from local data when analytics not loaded yet
  const summary = stats?.summary ?? {
    totalVehicles: vehicles.length,
    activeVehicles: vehicles.filter((v) => v.status === "Active").length,
    totalDrivers: drivers.length,
    availableDrivers: drivers.filter((d) => d.status === "Available").length,
    totalTrips: trips.length,
    activeTrips: trips.filter((t) => t.status === "In Progress").length,
    totalBookings: 0,
    totalRevenue: 0,
  };

  const monthlyData = (stats?.monthlyBookings ?? []).map((m) => ({
    month: MONTH_NAMES[(m._id.month - 1) % 12],
    bookings: m.count,
    revenue: m.revenue,
  }));

  const tripStatusData = (stats?.tripStatus ?? []).map((t) => ({
    name: t._id,
    value: t.count,
    color: TRIP_STATUS_COLORS[t._id] ?? "hsl(var(--chart-5))",
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Dashboard"
        description="Real-time overview of your transport operations"
      />

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Vehicles"
          value={summary.totalVehicles}
          icon={Truck}
          hint={`${summary.activeVehicles} active`}
        />
        <StatCard
          label="Total Drivers"
          value={summary.totalDrivers}
          icon={Users}
          hint={`${summary.availableDrivers} available`}
        />
        <StatCard
          label="Total Trips"
          value={summary.totalTrips}
          icon={MapPin}
          hint={`${summary.activeTrips} in progress`}
        />
        <StatCard
          label="Total Revenue"
          value={`₹${summary.totalRevenue.toLocaleString()}`}
          icon={IndianRupee}
          hint={`${summary.totalBookings} bookings`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Monthly Bookings</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/analytics">
                View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : monthlyData.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
                No booking data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Trip Status Pie */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Trip Status</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/trips">
                Manage <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : tripStatusData.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
                No trip data yet
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="60%" height={180}>
                  <PieChart>
                    <Pie
                      data={tripStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {tripStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {tripStatusData.map((t) => (
                    <div key={t.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ background: t.color }}
                        />
                        <span className="text-muted-foreground">{t.name}</span>
                      </div>
                      <span className="font-medium">{t.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Trips */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Recent Trips</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/trips">
              View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentTrips.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No trips yet.{" "}
              <Link to="/trips" className="text-primary hover:underline">
                Create your first trip
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentTrips.map((t) => {
                const v = vehicles.find((x) => x.id === t.vehicleId);
                const d = drivers.find((x) => x.id === t.driverId);
                return (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/40"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {t.origin ? `${t.origin} → ` : ""}{t.destination}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {v?.plate ?? "—"} · {d?.name ?? "—"} · {t.date}
                        </p>
                      </div>
                    </div>
                    <Badge variant={tripStatusVariant(t.status)}>{t.status}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Add Vehicle", to: "/vehicles", icon: Truck, color: "bg-blue-500/10 text-blue-500" },
          { label: "Add Driver", to: "/drivers", icon: Users, color: "bg-green-500/10 text-green-500" },
          { label: "New Trip", to: "/trips", icon: Activity, color: "bg-purple-500/10 text-purple-500" },
          { label: "New Booking", to: "/bookings", icon: Ticket, color: "bg-orange-500/10 text-orange-500" },
        ].map((item) => (
          <Link key={item.label} to={item.to}>
            <Card className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30">
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.color}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    Go <ArrowRight className="h-3 w-3" />
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
