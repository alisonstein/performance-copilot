import type { ReactNode } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { getOrCreateProfile, requireUser } from "@/lib/supabase/auth";
import { getPlanLimits } from "@/lib/plans/limits";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { supabase, user } = await requireUser();
  const profile = await getOrCreateProfile(supabase, user.id, user.email);
  const planLabel = getPlanLimits(profile.plan).label;
  const userName = profile.full_name || profile.email || "Você";

  return (
    <div className="flex min-h-screen bg-bg lg:flex-row">
      <Sidebar userName={userName} planLabel={planLabel} />
      <main className="min-w-0 flex-1 pb-16 lg:pb-0">
        <div className="container-page py-6 sm:py-8 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
