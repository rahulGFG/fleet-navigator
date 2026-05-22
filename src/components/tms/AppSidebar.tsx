import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Truck, Users, MapPin, Route as RouteIcon,
  Ticket, CreditCard, Wrench, Bell, BarChart3,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { useNotifications } from "@/hooks/use-tms";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard",  url: "/dashboard",     icon: LayoutDashboard },
      { title: "Analytics",  url: "/analytics",     icon: BarChart3 },
    ],
  },
  {
    label: "Fleet",
    items: [
      { title: "Vehicles",     url: "/vehicles",     icon: Truck },
      { title: "Drivers",      url: "/drivers",      icon: Users },
      { title: "Routes",       url: "/routes",       icon: RouteIcon },
      { title: "Maintenance",  url: "/maintenance",  icon: Wrench },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Trips",     url: "/trips",     icon: MapPin },
      { title: "Bookings",  url: "/bookings",  icon: Ticket },
      { title: "Payments",  url: "/payments",  icon: CreditCard },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Notifications", url: "/notifications", icon: Bell, badge: true },
    ],
  },
];

export function AppSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (url: string) => path === url || path.startsWith(url + "/");
  const { unread } = useNotifications();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground font-bold shrink-0">
            T
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="font-semibold text-sidebar-foreground leading-tight">TMS Admin</p>
            <p className="text-[10px] text-sidebar-foreground/60 leading-tight">Transport Management</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.badge && unread > 0 && (
                      <SidebarMenuBadge>{unread > 99 ? "99+" : unread}</SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
