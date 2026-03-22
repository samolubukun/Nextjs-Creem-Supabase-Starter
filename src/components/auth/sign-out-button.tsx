"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowser } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const supabase = createSupabaseBrowser();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <Button
      variant="ghost"
      onClick={handleSignOut}
      className="w-full text-destructive-soft bg-destructive-soft/5 hover:bg-destructive-soft/10 transition-all px-6 py-6 rounded-2xl gap-3 font-black uppercase tracking-widest text-[10px] border-2 border-destructive-soft/10 hover:border-destructive-soft/20"
    >
      <LogOut className="size-4 -scale-x-100" />
      Sign Out
    </Button>
  );
}
