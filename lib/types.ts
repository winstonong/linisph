export type UserRole = "customer" | "cleaner";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  city: string;
  barangay: string | null;
  bio: string | null;
  avatar_url: string | null;
  services_offered: string[] | null;
  hourly_rate: number | null;
  rating_avg: number | null;
  rating_count: number;
  is_available: boolean;
  created_at: string;
}

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "declined";

export interface Booking {
  id: string;
  customer_id: string;
  cleaner_id: string;
  status: BookingStatus;
  service_type: string;
  scheduled_date: string;
  scheduled_time: string | null;
  address: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  cleaner?: Profile;
  customer?: Profile;
}

export type JobStatus = "open" | "assigned" | "completed" | "cancelled";

export interface Job {
  id: string;
  customer_id: string;
  title: string;
  description: string | null;
  service_type: string;
  budget_min: number | null;
  budget_max: number | null;
  address: string;
  preferred_date: string;
  preferred_time: string | null;
  status: JobStatus;
  assigned_cleaner_id: string | null;
  created_at: string;
  // Joined
  customer?: Profile;
  bids?: Bid[];
}

export interface Bid {
  id: string;
  job_id: string;
  cleaner_id: string;
  price: number;
  message: string | null;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  // Joined
  cleaner?: Profile;
}

export interface Review {
  id: string;
  booking_id: string | null;
  job_id: string | null;
  customer_id: string;
  cleaner_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  // Joined
  customer?: Profile;
}

export const SERVICE_TYPES = [
  { value: "regular", label: "Regular Cleaning" },
  { value: "deep_clean", label: "Deep Clean" },
  { value: "move_out", label: "Move-out Clean" },
  { value: "airbnb", label: "Airbnb Turnover" },
  { value: "office", label: "Office Cleaning" },
] as const;
