-- =============================================
-- LinisPH Database Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- =============================================

-- 1. PROFILES TABLE
-- Extends auth.users with app-specific fields
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('customer', 'cleaner')),
  full_name text not null,
  phone text,
  city text not null default 'Manila',
  barangay text,
  bio text,
  avatar_url text,
  services_offered text[],
  hourly_rate integer,
  rating_avg numeric(2,1) default 0,
  rating_count integer default 0,
  is_available boolean default true,
  created_at timestamptz default now()
);

-- 2. BOOKINGS TABLE
-- Browse & Request flow
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id),
  cleaner_id uuid not null references public.profiles(id),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled', 'declined')),
  service_type text not null,
  scheduled_date date not null,
  scheduled_time time,
  address text not null,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. JOBS TABLE
-- Post a Job flow
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id),
  title text not null,
  description text,
  service_type text not null,
  budget_min integer,
  budget_max integer,
  address text not null,
  preferred_date date not null,
  preferred_time time,
  status text not null default 'open' check (status in ('open', 'assigned', 'completed', 'cancelled')),
  assigned_cleaner_id uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- 4. BIDS TABLE
-- Cleaners bid on posted jobs
create table public.bids (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  cleaner_id uuid not null references public.profiles(id),
  price integer not null,
  message text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz default now(),
  unique (job_id, cleaner_id)
);

-- 5. REVIEWS TABLE
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id),
  job_id uuid references public.jobs(id),
  customer_id uuid not null references public.profiles(id),
  cleaner_id uuid not null references public.profiles(id),
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now(),
  -- One review per booking or job
  unique (booking_id),
  unique (job_id),
  -- Must reference either a booking or a job
  check (
    (booking_id is not null and job_id is null) or
    (booking_id is null and job_id is not null)
  )
);


-- =============================================
-- TRIGGERS
-- =============================================

-- Auto-create profile when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'customer'),
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update cleaner rating when a review is added
create or replace function public.update_cleaner_rating()
returns trigger as $$
begin
  update public.profiles
  set
    rating_avg = (
      select round(avg(rating)::numeric, 1)
      from public.reviews
      where cleaner_id = new.cleaner_id
    ),
    rating_count = (
      select count(*)
      from public.reviews
      where cleaner_id = new.cleaner_id
    )
  where id = new.cleaner_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_review_created
  after insert on public.reviews
  for each row execute function public.update_cleaner_rating();

-- Auto-update updated_at on bookings
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger bookings_updated_at
  before update on public.bookings
  for each row execute function public.update_updated_at();


-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

alter table public.profiles enable row level security;
alter table public.bookings enable row level security;
alter table public.jobs enable row level security;
alter table public.bids enable row level security;
alter table public.reviews enable row level security;

-- PROFILES: anyone can read, users can only update their own
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- BOOKINGS: involved parties can see their bookings
create policy "Users see own bookings"
  on public.bookings for select using (
    auth.uid() = customer_id or auth.uid() = cleaner_id
  );

create policy "Customers can create bookings"
  on public.bookings for insert with check (auth.uid() = customer_id);

create policy "Involved parties can update bookings"
  on public.bookings for update using (
    auth.uid() = customer_id or auth.uid() = cleaner_id
  );

-- JOBS: open jobs visible to all, own jobs always visible
create policy "Open jobs are viewable by everyone"
  on public.jobs for select using (
    status = 'open' or auth.uid() = customer_id or auth.uid() = assigned_cleaner_id
  );

create policy "Customers can create jobs"
  on public.jobs for insert with check (auth.uid() = customer_id);

create policy "Job owner can update"
  on public.jobs for update using (auth.uid() = customer_id);

-- BIDS: cleaners see own bids, job owner sees all bids on their job
create policy "View own bids or bids on own jobs"
  on public.bids for select using (
    auth.uid() = cleaner_id or
    auth.uid() in (select customer_id from public.jobs where id = job_id)
  );

create policy "Cleaners can create bids"
  on public.bids for insert with check (auth.uid() = cleaner_id);

create policy "Bid parties can update"
  on public.bids for update using (
    auth.uid() = cleaner_id or
    auth.uid() in (select customer_id from public.jobs where id = job_id)
  );

-- REVIEWS: viewable by everyone, only customer from completed work can create
create policy "Reviews are viewable by everyone"
  on public.reviews for select using (true);

create policy "Customers can create reviews"
  on public.reviews for insert with check (auth.uid() = customer_id);
