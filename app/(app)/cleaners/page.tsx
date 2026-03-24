import { createClient } from "@/lib/supabase/server";
import CleanerCard from "@/components/cleaner-card";
import type { Profile } from "@/lib/types";
import CleanerFilters from "./filters";

export default async function CleanersPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("*")
    .eq("role", "cleaner")
    .eq("is_available", true)
    .order("rating_avg", { ascending: false });

  if (service) {
    query = query.contains("services_offered", [service]);
  }

  const { data: cleaners } = await query;

  return (
    <div className="px-6 pt-14 pb-6">
      <h1 className="text-2xl font-bold mb-2">Find a Cleaner</h1>
      <p className="text-gray-500 text-sm mb-4">
        {cleaners?.length || 0} cleaner{cleaners?.length !== 1 ? "s" : ""} available
      </p>

      <CleanerFilters active={service || ""} />

      <div className="space-y-3 mt-4">
        {cleaners && cleaners.length > 0 ? (
          cleaners.map((c) => <CleanerCard key={c.id} cleaner={c as Profile} />)
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p>No cleaners found.</p>
            <p className="text-sm mt-1">Try a different filter or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}
