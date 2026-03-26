"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function deleteUserAction(userId: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const authSupabase = await createSupabaseServer();
  const {
    data: { user: adminUser },
  } = await authSupabase.auth.getUser();

  // 1. Verify the requester is actually an admin
  const adminEmails = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "")
    .split(",")
    .map((e) => e.trim());

  if (!adminUser?.email || !adminEmails.includes(adminUser.email)) {
    throw new Error("Unauthorized: Only admins can perform this action.");
  }

  // 2. Perform the deletion via Admin API
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    console.error("Deletion Error:", error.message);
    return { success: false, error: error.message };
  }

  // 3. Clear cache to reflect the new user list
  revalidatePath("/dashboard/admin");
  return { success: true };
}
