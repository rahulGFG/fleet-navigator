export type Vehicle = {
  id: string;
  plate: string;
  model: string;
  type: string;
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