export type VehicleType =
  | "Truck" | "Car" | "Bus" | "Bike" | "Van"
  | "Mini Truck" | "Auto Rickshaw" | "Taxi" | "Ambulance"
  | "Trailer" | "Pickup" | "Tempo" | "Scooter" | "Bicycle"
  | "Electric Vehicle" | "School Bus" | "Luxury Bus"
  | "Container Truck" | "Delivery Van" | "Tow Truck";

export const VEHICLE_TYPES: VehicleType[] = [
  "Truck", "Car", "Bus", "Bike", "Van",
  "Mini Truck", "Auto Rickshaw", "Taxi", "Ambulance",
  "Trailer", "Pickup", "Tempo", "Scooter", "Bicycle",
  "Electric Vehicle", "School Bus", "Luxury Bus",
  "Container Truck", "Delivery Van", "Tow Truck",
];

export type Vehicle = {
  id: string;
  plate: string;
  model: string;
  type: VehicleType | string;
  capacity: string;
  status: "Active" | "Maintenance" | "Inactive";
};

export type Driver = {
  id: string;
  name: string;
  license: string;
  phone: string;
  experience: string;
  status: "Available" | "On Trip" | "Off Duty";
};

export type Trip = {
  id: string;
  vehicleId: string;
  driverId: string;
  date: string;
  destination: string;
  origin: string;
  status: "Scheduled" | "In Progress" | "Completed" | "Cancelled";
};