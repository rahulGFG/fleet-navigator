import { createFileRoute } from "@tanstack/react-router";
import { Truck, Users, MapPin, Activity } from "lucide-react";
import { StatCard } from "@/components/tms/StatCard";
import { PageHeader } from "@/components/tms/PageHeader";
import { useVehicles, useDrivers, useTrips } from "@/hooks/use-tms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Transport Management" },
      { name: "description", content: "Overview of fleet, drivers, and trips." },
    ],
  }),
  component: Index,
});

function Index() {
  const { items: vehicles } = useVehicles();
  const { items: drivers } = useDrivers();
  const { items: trips } = useTrips();

  const activeTrips = trips.filter((t) => t.status === "In Progress").length;
  const recentTrips = [...trips].slice(-5).reverse();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Dashboard"
        description="Real-time overview of your transport operations"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Vehicles" value={vehicles.length} icon={Truck} hint="Fleet size" />
        <StatCard label="Total Drivers" value={drivers.length} icon={Users} hint="Registered" />
        <StatCard label="Total Trips" value={trips.length} icon={MapPin} hint="All time" />
        <StatCard label="Active Trips" value={activeTrips} icon={Activity} hint="In progress" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Trips</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTrips.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No trips yet. Create your first trip to see it here.
            </p>
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
                    <div>
                      <p className="font-medium">{t.destination}</p>
                      <p className="text-xs text-muted-foreground">
                        {v?.plate ?? "—"} · {d?.name ?? "—"} · {t.date}
                      </p>
                    </div>
                    <Badge variant="secondary">{t.status}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
