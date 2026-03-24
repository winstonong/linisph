export type UserRole = "customer" | "cleaner";

export interface Category {
  id: number;
  slug: string;
  name: string;
  icon: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
}

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
  total_tasks_completed: number;
  completion_rate: number;
  category_slugs: string[] | null;
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
  cleaner?: Profile;
  customer?: Profile;
}

export type TaskStatus = "open" | "assigned" | "completed" | "cancelled";

export interface Task {
  id: string;
  customer_id: string;
  title: string;
  description: string | null;
  service_type: string;
  category_slug: string | null;
  budget_min: number | null;
  budget_max: number | null;
  address: string;
  preferred_date: string;
  preferred_time: string | null;
  status: TaskStatus;
  assigned_cleaner_id: string | null;
  created_at: string;
  customer?: Profile;
  category?: Category;
  bids?: Offer[];
}

// Keep Job as alias for backward compatibility
export type JobStatus = TaskStatus;
export type Job = Task;

export interface Offer {
  id: string;
  job_id: string;
  cleaner_id: string;
  price: number;
  message: string | null;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  cleaner?: Profile;
}

// Keep Bid as alias for backward compatibility
export type Bid = Offer;

export interface Review {
  id: string;
  booking_id: string | null;
  job_id: string | null;
  customer_id: string;
  cleaner_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  customer?: Profile;
}

export const SERVICE_TYPES = [
  { value: "regular", label: "Regular Cleaning" },
  { value: "deep_clean", label: "Deep Clean" },
  { value: "move_out", label: "Move-out Clean" },
  { value: "airbnb", label: "Airbnb Turnover" },
  { value: "office", label: "Office Cleaning" },
] as const;
