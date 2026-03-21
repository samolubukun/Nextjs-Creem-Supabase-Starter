import { Sidebar } from "@/components/layout/sidebar";
import { Search, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationDropdown } from "@/components/layout/notification-dropdown";
import { createSupabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user details for header
  const userDetails = {
    name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
    email: user.email || "",
    provider: user.app_metadata?.provider || "email",
  };

  // Check if current user is an admin
  const adminEmails = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "")
    .split(",")
    .map((e) => e.trim());
  const isAdmin = adminEmails.includes(userDetails.email);

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      {/* Sidebar - Fixed/Sticky on desktop */}
      <Sidebar isAdmin={isAdmin} />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Dashboard Header - Fixed at the top */}
        <header className="h-16 md:h-24 bg-background/80 backdrop-blur-xl border-b border-border sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 flex-1">
             {/* Mobile Logo/Toggle Placeholder - Actual toggle is in Sidebar.tsx but we need space here */}
             <div className="size-10 md:hidden shrink-0" />
             
             <div className="relative max-w-md w-full hidden md:block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input 
                   type="text" 
                   placeholder="Search command center..." 
                   className="w-full h-11 bg-secondary border border-border rounded-xl pl-11 pr-4 text-xs font-bold focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground transition-all"
                />
             </div>

             {/* Mobile Title */}
             <h1 className="md:hidden text-sm font-black uppercase tracking-tighter">SAASXCREEM</h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
             {/* Live Meter Placeholder */}
             <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                <Zap className="size-4 fill-primary text-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Live Connection</span>
             </div>

             <NotificationDropdown />
             
             <div className="h-6 md:h-8 w-px bg-border mx-1 md:mx-2" />
             
             {/* User Profile in Header */}
             <div className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-1.5 hover:bg-secondary rounded-2xl transition-colors cursor-pointer group border border-transparent hover:border-border">
                <div className="size-7 md:size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black uppercase text-[10px] md:text-xs">
                   {userDetails.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                   <p className="text-[10px] font-black uppercase tracking-tight truncate leading-tight">{userDetails.name}</p>
                   <p className="text-[8px] text-muted-foreground truncate uppercase font-bold leading-tight">
                      {userDetails.provider === "google" ? "Google Node" : "Standard Agent"}
                   </p>
                </div>
             </div>
          </div>
        </header>

        {/* Dash Main View Container */}
        <main className="flex-1 w-full px-4 md:px-8 pb-8 pt-4 sm:pt-6 lg:pt-8 box-border overflow-x-hidden">
          <div className="w-full max-w-7xl mx-auto flex flex-col min-w-0">
             {children}
          </div>
        </main>
      </div>
    </div>
  );
}
