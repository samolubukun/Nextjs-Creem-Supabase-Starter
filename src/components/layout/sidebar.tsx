"use client";

import {
  ChevronRight,
  CreditCard,
  Key,
  LayoutDashboard,
  Menu,
  Rocket,
  Settings,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "AI Assistant", href: "/dashboard/chat", icon: Rocket },
  { name: "Transactions", href: "/dashboard/transactions", icon: CreditCard },
  { name: "Licenses", href: "/dashboard/licenses", icon: Key },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar({ isAdmin }: { isAdmin?: boolean }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();

  const finalNavItems = isAdmin
    ? [...navItems, { name: "Admin CRM", href: "/dashboard/admin", icon: Rocket }]
    : navItems;

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "fixed top-3 z-50 md:hidden h-10 w-10 bg-background/50 backdrop-blur-md border border-border shadow-sm rounded-xl transition-all",
          isOpen ? "right-4" : "left-4",
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>

      {/* Backdrop */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 bg-background border-r transform transition-transform duration-300 ease-in-out md:translate-x-0 md:sticky md:top-0 md:block h-screen shrink-0 overflow-x-hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo Section */}
          <div className="h-24 flex items-center justify-between px-8 border-b shrink-0">
            <Link
              href="/"
              className="text-2xl font-black tracking-tighter uppercase whitespace-nowrap"
            >
              SAASXCREEM
            </Link>
            <ThemeToggle />
          </div>

          {/* Navigation - Scrollable */}
          <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent hover:scrollbar-thumb-slate-300 transition-colors">
            {finalNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-black uppercase tracking-tight transition-all group",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <item.icon
                    className={cn(
                      "size-5",
                      isActive ? "text-white" : "group-hover:text-primary transition-colors",
                    )}
                  />
                  {item.name}
                  {isActive && <ChevronRight className="ml-auto size-4" />}
                </Link>
              );
            })}

            {/* Upgrade Banner - Integrated into Nav */}
            <div className="pt-6 pb-2">
              <div className="bg-slate-900 rounded-[1.5rem] p-4 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent" />
                <div className="flex items-center gap-3 mb-3 relative z-10">
                  <Rocket className="size-6 text-primary" />
                  <div>
                    <h4 className="text-white text-xs font-black tracking-tighter uppercase">
                      Command Pro
                    </h4>
                    <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest">
                      Unlock Stack
                    </p>
                  </div>
                </div>
                <Button
                  asChild
                  size="sm"
                  className="w-full h-8 bg-white text-black hover:bg-primary transition-colors relative z-10 font-black uppercase tracking-tighter text-[9px]"
                >
                  <Link href="/pricing">Upgrade</Link>
                </Button>
              </div>
            </div>
          </nav>

          {/* User Section - Sign Out Only */}
          <div className="p-4 border-t shrink-0">
            <SignOutButton />
          </div>
        </div>
      </aside>
    </>
  );
}
