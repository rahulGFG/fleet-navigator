// ── Vehicle ──────────────────────────────────────────────────────────────────
export type VehicleType =
  | "Truck" | "Car" | "Bus" | "Bike" | "Van"
  | "Mini Truck" | "Auto Rickshaw" | "Taxi" | "Ambulance"
  | "Trailer" | "Pickup" | "Tempo" | "Scooter" | "Bicycle"
  | "Electric Vehicle" | "School Bus" | "Luxury Bus"
  | "Container Truck" | "Delivery Van" | "Tow Truck";

export const VEHICLE_TYPES: VehicleType[] = [
  "Truck","Car","Bus","Bike","Van","Mini Truck","Auto Rickshaw","Taxi",
  "Ambulance","Trailer","Pickup","Tempo","Scooter","Bicycle",
  "Electric Vehicle","School Bus","Luxury Bus","Container Truck","Delivery Van","Tow Truck",
];

export type Vehicle = {
  id: string;
  plate: string;
  model: string;
  type: VehicleType | string;
  capacity: string;
  status: "Active" | "Maintenance" | "Inactive";
};

// ── Driver ───────────────────────────────────────────────────────────────────
export type Driver = {
  id: string;
  name: string;
  license: string;
  phone: string;
  experience: string;
  status: "Available" | "On Trip" | "Off Duty";
};

// ── Route ────────────────────────────────────────────────────────────────────
export type RouteStop = { name: string; lat?: number; lng?: number; order: number };

export type TmsRoute = {
  id: string;
  name: string;
  origin: string;
  destination: string;
  originLat?: number;
  originLng?: number;
  destLat?: number;
  destLng?: number;
  distanceKm: number;
  durationMin: number;
  stops: RouteStop[];
  isActive: boolean;
};

// ── Trip ─────────────────────────────────────────────────────────────────────
export type Trip = {
  id: string;
  vehicleId: string;
  driverId: string;
  routeId?: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  destination: string;
  origin: string;
  totalSeats: number;
  fare: number;
  status: "Scheduled" | "In Progress" | "Completed" | "Cancelled";
  liveLocation?: { lat: number; lng: number; updatedAt: string };
};

// ── Booking ──────────────────────────────────────────────────────────────────
export type Booking = {
  id: string;
  bookingRef: string;
  tripId: string;
  userId: string;
  seatNumber: number;
  passengerName: string;
  passengerPhone: string;
  passengerEmail: string;
  fare: number;
  status: "Pending" | "Confirmed" | "Cancelled" | "Completed";
  paymentStatus: "Unpaid" | "Paid" | "Refunded";
  paymentId: string;
  createdAt: string;
};

// ── Payment ──────────────────────────────────────────────────────────────────
export type Payment = {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  method: "Cash" | "Online" | "Card" | "UPI";
  status: "Pending" | "Success" | "Failed" | "Refunded";
  transactionId: string;
  paidAt: string;
  createdAt: string;
};

// ── Maintenance ───────────────────────────────────────────────────────────────
export type Maintenance = {
  id: string;
  vehicleId: string;
  type: "Routine" | "Repair" | "Inspection" | "Insurance" | "Other";
  description: string;
  cost: number;
  date: string;
  nextDueDate: string;
  status: "Scheduled" | "In Progress" | "Completed";
  notes: string;
};

// ── Notification ──────────────────────────────────────────────────────────────
export type Notification = {
  id: string;
  title: string;
  message: string;
  type: "booking" | "trip" | "payment" | "system" | "alert";
  isRead: boolean;
  createdAt: string;
};

// ── Analytics ─────────────────────────────────────────────────────────────────
export type DashboardStats = {
  summary: {
    totalVehicles: number; activeVehicles: number;
    totalDrivers: number;  availableDrivers: number;
    totalTrips: number;    activeTrips: number;
    totalBookings: number; totalRevenue: number;
  };
  tripStatus: { _id: string; count: number }[];
  monthlyBookings: { _id: { year: number; month: number }; count: number; revenue: number }[];
  vehicleTypes: { _id: string; count: number }[];
};
