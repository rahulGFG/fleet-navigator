import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area,
} from "recharts";
import { TrendingUp, Truck, Users, MapPin, IndianRupee, Activity, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/tms/PageHeader";
import { StatCard } from "@/components/tms/StatCard";
import { useDashboardStats } from "@/hooks/use-tms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics — TMS" }] }),
  component: AnalyticsPage,
});

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const PIE_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const TRIP_STATUS_COLORS: Record<string, string> = {
  "Scheduled":   "hsl(var(--chart-2))",
  "In Progress": "hsl(var(--chart-1))",
  "Completed":   "hsl(var(--chart-3))",
  "Cancelled":   "hsl(var(--destructive))",
};

function AnalyticsPage() {
  const { stats, loading } = useDashboardStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-24 text-muted-foreground">
        <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p>No analytics data available yet.</p>
        <p className="text-sm mt-1">Add vehicles, drivers, and trips to see insights.</p>
      </div>
    );
  }

  const { summary, tripStatus, monthlyBookings, vehicleTypes } = stats;

  // Format monthly data for charts
  const monthlyData = monthlyBookings.map((m) => ({
    month: MONTH_NAMES[(m._id.month - 1) % 12],
    bookings: m.count,
    revenue: m.revenue,
  }));

  // Trip status pie data
  const tripStatusData = tripStatus.map((t) => ({
    name: t._id,
    value: t.count,
    color: TRIP_STATUS_COLORS[t._id] ?? "hsl(var(--chart-5))",
  }));

  // Vehicle type bar data (top 8)
  const vehicleTypeData = vehicleTypes.slice(0, 8).map((v) => ({
    type: v._id,
    count: v.count,
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Analytics"
        description="Fleet performance insights and revenue reports"
      />

      {/* Summary Stats */}
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

      {/* Fleet Health */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fleet Utilization</p>
                <p className="text-2xl font-bold mt-1">
                  {summary.totalVehicles > 0
                    ? Math.round((summary.activeVehicles / summary.totalVehicles) * 100)
                    : 0}%
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Truck className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${summary.totalVehicles > 0
                    ? (summary.activeVehicles / summary.totalVehicles) * 100
                    : 0}%`,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {summary.activeVehicles} of {summary.totalVehicles} vehicles active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Driver Availability</p>
                <p className="text-2xl font-bold mt-1">
                  {summary.totalDrivers > 0
                    ? Math.round((summary.availableDrivers / summary.totalDrivers) * 100)
                    : 0}%
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-green-500 transition-all"
                style={{
                  width: `${summary.totalDrivers > 0
                    ? (summary.availableDrivers / summary.totalDrivers) * 100
                    : 0}%`,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {summary.availableDrivers} of {summary.totalDrivers} drivers available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Trips</p>
                <p className="text-2xl font-bold mt-1">{summary.activeTrips}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                <Activity className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {tripStatus.map((t) => (
                <Badge key={t._id} variant="outline" className="text-xs">
                  {t._id}: {t.count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Bookings Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                No booking data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
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

        {/* Trip Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Trip Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {tripStatusData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                No trip data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={tripStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
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
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span style={{ fontSize: "12px", color: "hsl(var(--foreground))" }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Area Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Revenue (₹)</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                No revenue data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(v: number) => [`₹${v.toLocaleString()}`, "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#revenueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Vehicle Types Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fleet by Vehicle Type</CardTitle>
          </CardHeader>
          <CardContent>
            {vehicleTypeData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                No vehicle data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={vehicleTypeData}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="type"
                    width={90}
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
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {vehicleTypeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
