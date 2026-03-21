import { creem } from "@/lib/creem";
import { createSupabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function POST() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("creem_customer_id")
    .eq("user_id", user.id)
    .single();

  if (!subscription?.creem_customer_id) {
    return new Response("No subscription found", { status: 404 });
  }

  const portal = await creem.customers.generateBillingLinks({
    customerId: subscription.creem_customer_id,
  });

  if (portal.customerPortalLink) {
    redirect(portal.customerPortalLink);
  }

  return new Response("Failed to generate portal link", { status: 500 });
}
