import type { Meta, StoryObj } from "@storybook/nextjs";
import { CreditCard, Key, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const meta = {
  title: "Dashboard/StatCards",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const CreditsCard: Story = {
  render: () => (
    <Card className="border-none shadow-sm h-full bg-white">
      <CardHeader className="p-8 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-black uppercase tracking-tight">
              Credit Ledger
            </CardTitle>
            <CardDescription className="font-medium">Available tokens</CardDescription>
          </div>
          <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
            <CreditCard className="size-6" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8 pt-0">
        <div className="text-5xl font-black tracking-tighter text-foreground mb-2">247</div>
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-6">
          Remaining
        </p>
        <Button
          variant="outline"
          className="w-full rounded-2xl h-12 font-black uppercase tracking-tight border-2"
        >
          Top Up Credits
        </Button>
      </CardContent>
    </Card>
  ),
};

export const CreditsCardEmpty: Story = {
  render: () => (
    <Card className="border-none shadow-sm h-full bg-white">
      <CardHeader className="p-8 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-black uppercase tracking-tight">
              Credit Ledger
            </CardTitle>
            <CardDescription className="font-medium">Available tokens</CardDescription>
          </div>
          <div className="size-12 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive shadow-sm">
            <CreditCard className="size-6" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8 pt-0">
        <div className="text-5xl font-black tracking-tighter text-destructive mb-2">0</div>
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-6">
          Depleted
        </p>
        <Button className="w-full rounded-2xl h-12 font-black uppercase tracking-tight">
          Top Up Credits
        </Button>
      </CardContent>
    </Card>
  ),
};

export const LicenseKeyCard: Story = {
  render: () => (
    <Card className="border-none shadow-sm h-full bg-white">
      <CardHeader className="p-8 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-black uppercase tracking-tight">
              License Keys
            </CardTitle>
            <CardDescription className="font-medium">Active installations</CardDescription>
          </div>
          <div className="size-12 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground shadow-sm">
            <Key className="size-6" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8 pt-0 space-y-3">
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">
              Key
            </p>
            <code className="text-sm font-mono font-bold text-foreground break-all">
              SAASX-****-****-K9X2
            </code>
          </div>
          <span className="shrink-0 text-[8px] font-black uppercase tracking-widest text-success bg-success/5 px-2 py-1 rounded-full border border-success/20">
            Active
          </span>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">
              Key
            </p>
            <code className="text-sm font-mono font-bold text-foreground break-all">
              SAASX-****-****-M3P7
            </code>
          </div>
          <span className="shrink-0 text-[8px] font-black uppercase tracking-widest text-muted-foreground bg-slate-100 px-2 py-1 rounded-full border border-slate-200">
            Revoked
          </span>
        </div>
        <Button
          variant="outline"
          className="w-full rounded-2xl h-12 font-black uppercase tracking-tight border-2 mt-2"
        >
          Generate New Key
        </Button>
      </CardContent>
    </Card>
  ),
};

export const SpendingCard: Story = {
  render: () => (
    <Card className="border-none shadow-sm h-full bg-white">
      <CardHeader className="p-8 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-black uppercase tracking-tight">
              Total Invested
            </CardTitle>
            <CardDescription className="font-medium">Lifetime platform spend</CardDescription>
          </div>
          <div className="size-12 rounded-2xl bg-success/10 flex items-center justify-center text-success shadow-sm">
            <TrendingUp className="size-6" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8 pt-0">
        <div className="text-5xl font-black tracking-tighter text-foreground mb-2">$147.00</div>
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-6">
          Across 3 plans
        </p>
        <div className="flex items-center gap-2 p-4 rounded-2xl bg-success/5 border border-success/20">
          <Zap className="size-4 text-success shrink-0" />
          <p className="text-xs font-black uppercase tracking-tight text-success">
            Creator plan — active since Jan 15
          </p>
        </div>
      </CardContent>
    </Card>
  ),
};
