import type { Meta, StoryObj } from "@storybook/nextjs";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const meta = {
  title: "Auth/LoginForm",
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  render: () => (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)]">
        <CardHeader className="p-10 pb-6 text-center">
          <CardTitle className="text-4xl">Welcome Back</CardTitle>
          <CardDescription className="text-base font-medium mt-2">
            Log in to your command center to continue building.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-10 pt-0 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" type="email" placeholder="name@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" />
          </div>
          <Button className="w-full h-14 rounded-2xl text-lg font-black uppercase tracking-tight">
            Sign In to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)]">
        <CardHeader className="p-10 pb-6 text-center">
          <CardTitle className="text-4xl">Welcome Back</CardTitle>
          <CardDescription className="text-base font-medium mt-2">
            Log in to your command center to continue building.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-10 pt-0 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email2">Email address</Label>
            <Input id="email2" type="email" placeholder="name@example.com" disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password2">Password</Label>
            <Input id="password2" type="password" disabled />
          </div>
          <Button
            className="w-full h-14 rounded-2xl text-lg font-black uppercase tracking-tight"
            disabled
          >
            <Loader2 className="size-5 animate-spin mr-2" />
            Signing in...
          </Button>
        </CardContent>
      </Card>
    </div>
  ),
};

export const WithError: Story = {
  render: () => (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)]">
        <CardHeader className="p-10 pb-6 text-center">
          <CardTitle className="text-4xl">Welcome Back</CardTitle>
          <CardDescription className="text-base font-medium mt-2">
            Log in to your command center to continue building.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-10 pt-0 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email3">Email address</Label>
            <Input id="email3" type="email" placeholder="name@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password3">Password</Label>
            <Input id="password3" type="password" />
          </div>
          <div className="p-4 bg-destructive/10 text-destructive text-sm font-bold rounded-xl border border-destructive/20 text-center">
            Invalid login credentials. Please try again.
          </div>
          <Button className="w-full h-14 rounded-2xl text-lg font-black uppercase tracking-tight">
            Sign In to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  ),
};
