import type { Meta, StoryObj } from "@storybook/nextjs";
import { Loader2, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const meta = {
  title: "Auth/SignupForm",
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  render: () => (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden">
        <div className="h-2 bg-primary w-full" />
        <CardHeader className="p-10 pb-6 text-center">
          <CardTitle className="text-4xl">Start Your System</CardTitle>
          <CardDescription className="text-base font-medium mt-2">
            Create your account and launch your SaaS in minutes.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-10 pt-0 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="signup-email">Email address</Label>
            <Input id="signup-email" type="email" placeholder="name@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-password">Create Password</Label>
            <Input id="signup-password" type="password" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pt-1">
              Min 8 characters, include numbers.
            </p>
          </div>
          <Button className="w-full h-14 rounded-2xl text-lg font-black uppercase tracking-tight">
            Initiate Account
          </Button>
        </CardContent>
      </Card>
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden">
        <div className="h-2 bg-primary w-full" />
        <CardHeader className="p-10 pb-6 text-center">
          <CardTitle className="text-4xl">Start Your System</CardTitle>
          <CardDescription className="text-base font-medium mt-2">
            Create your account and launch your SaaS in minutes.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-10 pt-0 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="signup-email2">Email address</Label>
            <Input id="signup-email2" type="email" placeholder="name@example.com" disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-password2">Create Password</Label>
            <Input id="signup-password2" type="password" disabled />
          </div>
          <Button
            className="w-full h-14 rounded-2xl text-lg font-black uppercase tracking-tight"
            disabled
          >
            <Loader2 className="size-5 animate-spin mr-2" />
            Creating Account...
          </Button>
        </CardContent>
      </Card>
    </div>
  ),
};

export const ConfirmationSent: Story = {
  render: () => (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden">
        <div className="h-2 bg-primary w-full" />
        <CardContent className="p-10 pt-8 text-center">
          <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6">
            <Rocket className="size-10" />
          </div>
          <h3 className="text-2xl font-black tracking-tighter uppercase mb-2">Check your email</h3>
          <p className="text-muted-foreground font-medium">
            Check your email for the confirmation link!
          </p>
          <Button asChild variant="outline" className="mt-8 rounded-2xl">
            <a href="/login">Back to Sign In</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  ),
};

export const WithValidationError: Story = {
  render: () => (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden">
        <div className="h-2 bg-primary w-full" />
        <CardHeader className="p-10 pb-6 text-center">
          <CardTitle className="text-4xl">Start Your System</CardTitle>
          <CardDescription className="text-base font-medium mt-2">
            Create your account and launch your SaaS in minutes.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-10 pt-0 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="signup-email3">Email address</Label>
            <Input id="signup-email3" type="email" placeholder="name@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-password3">Create Password</Label>
            <Input id="signup-password3" type="password" defaultValue="short" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pt-1">
              Min 8 characters, include numbers.
            </p>
          </div>
          <div className="p-4 bg-destructive/10 text-destructive text-sm font-bold rounded-xl border border-destructive/20 text-center">
            Password must be at least 8 characters.
          </div>
          <Button className="w-full h-14 rounded-2xl text-lg font-black uppercase tracking-tight">
            Initiate Account
          </Button>
        </CardContent>
      </Card>
    </div>
  ),
};
