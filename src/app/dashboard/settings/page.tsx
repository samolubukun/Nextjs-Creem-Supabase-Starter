import { Info, Shield, User } from "lucide-react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { createSupabaseServer } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
  const email = user.email || "";
  const provider = user.app_metadata?.provider || "email";

  return (
    <div className="space-y-10">
      <div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2 block">
          Configuration
        </span>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none text-foreground">
          System Settings
        </h1>
        <p className="text-muted-foreground font-medium mt-4">
          Review your account parameters and authentication protocols.
        </p>
      </div>

      <div className="max-w-3xl space-y-8">
        <Card className="border border-border shadow-sm bg-card">
          <CardHeader className="p-8">
            <CardTitle className="text-xl flex items-center gap-3 text-foreground">
              <User className="size-5 text-primary" /> Profile Identity
            </CardTitle>
            <CardDescription>
              Authenticated user details synchronized with the CREEMxSAAS network.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                  Identity Name
                </Label>
                <div className="h-12 flex items-center px-4 bg-secondary rounded-xl border border-border font-bold text-foreground">
                  {name}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                  Email Vector
                </Label>
                <div className="h-12 flex items-center px-4 bg-secondary rounded-xl border border-border font-bold text-muted-foreground">
                  {email}
                </div>
              </div>
            </div>

            <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Shield className="size-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                    Access Protocol
                  </p>
                  <p className="text-sm font-black uppercase tracking-tight text-foreground">
                    {provider === "google" ? "Google Authentication" : "Standard Email Access"}
                  </p>
                </div>
              </div>
              <div className="px-4 py-1.5 bg-background rounded-full border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary shadow-sm">
                Verified
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-destructive/20 bg-destructive/5 overflow-hidden shadow-sm">
          <div className="h-1 bg-destructive w-full" />
          <CardHeader className="p-8">
            <CardTitle className="text-xl text-destructive flex items-center gap-3">
              <Info className="size-5" /> Danger Zone
            </CardTitle>
            <CardDescription>Critical actions that cannot be reversed.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-card rounded-3xl border border-destructive/10">
              <div>
                <p className="font-black text-sm uppercase tracking-tight text-foreground">
                  Terminate Account
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  This will permanently purge all system data.
                </p>
              </div>
              <Button
                variant="destructive"
                className="rounded-xl font-black uppercase tracking-widest text-[10px] px-6 h-10 transition-transform active:scale-95"
              >
                Purge System
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
