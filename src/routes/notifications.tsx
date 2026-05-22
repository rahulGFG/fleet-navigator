import { createFileRoute } from "@tanstack/react-router";
import { Bell, BellOff, CheckCheck, Ticket, MapPin, CreditCard, Settings, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/tms/PageHeader";
import { useNotifications } from "@/hooks/use-tms";
import type { Notification } from "@/lib/tms-types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — TMS" }] }),
  component: NotificationsPage,
});

function typeIcon(type: Notification["type"]) {
  switch (type) {
    case "booking":  return Ticket;
    case "trip":     return MapPin;
    case "payment":  return CreditCard;
    case "alert":    return AlertTriangle;
    default:         return Settings;
  }
}

function typeColor(type: Notification["type"]) {
  switch (type) {
    case "booking":  return "text-blue-500 bg-blue-500/10";
    case "trip":     return "text-green-500 bg-green-500/10";
    case "payment":  return "text-yellow-500 bg-yellow-500/10";
    case "alert":    return "text-red-500 bg-red-500/10";
    default:         return "text-muted-foreground bg-muted";
  }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function NotificationsPage() {
  const { notifications, unread, markAllRead, refetch } = useNotifications();

  const handleMarkAllRead = async () => {
    await markAllRead();
    toast.success("All notifications marked as read");
  };

  const handleMarkOneRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`, {});
      refetch();
    } catch {
      // silent
    }
  };

  const unreadItems = notifications.filter((n) => !n.isRead);
  const readItems   = notifications.filter((n) => n.isRead);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Notifications"
        description={
          unread > 0
            ? `${unread} unread notification${unread !== 1 ? "s" : ""}`
            : "All caught up"
        }
        action={
          unread > 0 ? (
            <Button variant="outline" onClick={handleMarkAllRead}>
              <CheckCheck className="h-4 w-4 mr-2" /> Mark all read
            </Button>
          ) : undefined
        }
      />

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <BellOff className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No notifications</h3>
          <p className="text-sm text-muted-foreground mt-1">
            You're all caught up. Notifications will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Unread */}
          {unreadItems.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">Unread</h2>
                <Badge variant="default" className="text-xs">{unreadItems.length}</Badge>
              </div>
              <div className="space-y-2">
                {unreadItems.map((n) => (
                  <NotificationCard
                    key={n.id}
                    notification={n}
                    onMarkRead={() => handleMarkOneRead(n.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Read */}
          {readItems.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground">Earlier</h2>
              <div className="space-y-2">
                {readItems.map((n) => (
                  <NotificationCard key={n.id} notification={n} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NotificationCard({
  notification: n,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead?: () => void;
}) {
  const Icon = typeIcon(n.type);
  const colorClass = typeColor(n.type);

  return (
    <Card
      className={cn(
        "transition-colors",
        !n.isRead && "border-primary/30 bg-primary/5",
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", colorClass)}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className={cn("text-sm font-medium", !n.isRead && "text-foreground")}>
                  {n.title}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                  {n.message}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {timeAgo(n.createdAt)}
                </span>
                {!n.isRead && (
                  <span className="flex h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
            </div>
            {!n.isRead && onMarkRead && (
              <button
                onClick={onMarkRead}
                className="mt-2 text-xs text-primary hover:underline"
              >
                Mark as read
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
