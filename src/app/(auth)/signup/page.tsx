"use client";

import * as React from 'react';
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { initPostHog } from "@/lib/posthog";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ArrowLeft, Rocket } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Track signup event
      const posthog = initPostHog();
      if (posthog) {
        posthog.capture('user_signed_up', { email });
      }

      // Send Welcome Email
      // Note: We don't await this to avoid blocking the UI, but we trigger it
      fetch('/api/auth/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }).catch(console.error);

      setMessage("Check your email for the confirmation link!");
      setLoading(false);
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

        <Card className="border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden">
          <div className="h-2 bg-primary w-full" />
          <CardHeader className="p-10 pb-6 text-center">
            <CardTitle className="text-4xl">Start Your System</CardTitle>
            <CardDescription className="text-base font-medium mt-2">
              Create your account and launch your SaaS in minutes.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-10 pt-0">
            {message ? (
              <div className="text-center py-10">
                <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6">
                  <Rocket className="size-10" />
                </div>
                <h3 className="text-2xl font-black tracking-tighter uppercase mb-2">Check your email</h3>
                <p className="text-muted-foreground font-medium">{message}</p>
                <Button asChild variant="outline" className="mt-8 rounded-2xl">
                   <Link href="/login">Back to Sign In</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSignup} className="space-y-6">
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
                  <Label htmlFor="password">Create Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pt-1">
                    Min 8 characters, include numbers.
                  </p>
                </div>

                {error && (
                  <div className="p-4 bg-destructive/10 text-destructive text-sm font-bold rounded-xl border border-destructive/20 text-center">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-black uppercase tracking-tight" disabled={loading}>
                  {loading ? <Loader2 className="size-5 animate-spin mr-2" /> : "Initiate Account"}
                </Button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase font-black tracking-widest">
                    <span className="bg-card px-4 text-muted-foreground">Or with provider</span>
                  </div>
                </div>

                <OAuthButtons />
              </form>
            )}

            {!message && (
              <p className="mt-8 text-center text-sm font-bold text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline font-black uppercase tracking-tight">
                  Sign In
                </Link>
              </p>
            )}
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 px-10 leading-relaxed">
           By signing up, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  );
}
