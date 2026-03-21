"use client";

import * as React from 'react';
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" /> Back Home
      </Link>

      <div className="w-full max-w-lg">
        <div className="text-center mb-10 overflow-hidden pt-12 md:pt-0">
           <Link href="/" className="text-3xl font-black tracking-tighter uppercase mb-2 inline-block">SAASXCREEM</Link>
        </div>

        <Card className="border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)]">
          <CardHeader className="p-10 pb-6 text-center">
            <CardTitle className="text-4xl">Welcome Back</CardTitle>
            <CardDescription className="text-base font-medium mt-2">
              Log in to your command center to continue building.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-10 pt-0">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <div className="p-4 bg-destructive/10 text-destructive text-sm font-bold rounded-xl border border-destructive/20 text-center">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-black uppercase tracking-tight" disabled={loading}>
                {loading ? <Loader2 className="size-5 animate-spin mr-2" /> : "Sign In to Dashboard"}
              </Button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase font-black tracking-widest">
                  <span className="bg-card px-4 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <OAuthButtons />
            </form>

            <p className="mt-8 text-center text-sm font-bold text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline font-black uppercase tracking-tight">
                Create Account
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-xs font-black uppercase tracking-widest text-muted-foreground/60">
           Enterprise ready. GDPR compliant. Secure.
        </p>
      </div>
    </div>
  );
}
