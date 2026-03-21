import * as React from 'react';
import { redirect } from "next/navigation";
import { LicenseCard } from "@/components/billing/license-card";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LicensesPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: licenses } = await getSupabaseAdmin()
    .from("licenses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-10">
      <div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2 block">Assets Management</span>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none text-foreground">License Keys</h1>
        <p className="text-muted-foreground font-medium mt-4">Manage your digital credentials and active deployments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {licenses && licenses.length > 0 ? (
            licenses.map((license: any) => (
               <LicenseCard key={license.id || license.creem_license_key} license={license} />
            ))
         ) : (
            <div className="col-span-full py-20 text-center bg-secondary rounded-[2.5rem] border-2 border-dashed border-border">
               <p className="text-sm font-black uppercase tracking-widest text-muted-foreground opacity-60">No active licenses found.</p>
            </div>
         )}
      </div>
    </div>
  );
}
