"use client";

import * as React from "react";
import { Bell, Check, X, CreditCard, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getNotificationsAction, markAsReadAction, markAllAsReadAction } from "@/app/actions/notifications";

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    const data = await getNotificationsAction();
    setNotifications(data);
  };

  React.useEffect(() => {
    fetchNotifications();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => n.status === "open").length;

  const handleMarkAsRead = async (id: string) => {
    await markAsReadAction(id);
    fetchNotifications();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsReadAction();
    fetchNotifications();
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "checkout.completed":
      case "subscription_topup":
      case "purchase":
        return <CreditCard className="size-4 text-emerald-500" />;
      case "refund":
        return <AlertCircle className="size-4 text-amber-500" />;
      case "dispute":
        return <X className="size-4 text-destructive" />;
      case "subscription.canceled":
        return <X className="size-4 text-muted-foreground" />;
      case "subscription.past_due":
        return <AlertCircle className="size-4 text-destructive animate-pulse" />;
      default:
        return <Info className="size-4 text-blue-500" />;
    }
  };

  const getEventTitle = (n: any) => {
    switch (n.event_type) {
      case "checkout.completed": return "Checkout Successful";
      case "subscription_topup": return "Subscription Renewed";
      case "purchase": return "Credits Purchased";
      case "refund": return "Refund Issued";
      case "dispute": return "Dispute Opened";
      case "subscription.canceled": return "Subscription Cancelled";
      case "subscription.past_due": return "Payment Failed";
      default: return "System Notification";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setIsOpen(!isOpen)}
        className="size-8 md:size-10 rounded-xl text-muted-foreground hover:text-foreground relative"
      >
        <Bell className="size-4 md:size-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 size-2 bg-destructive rounded-full border-2 border-background animate-pulse" />
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-background/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-5 py-4 border-b border-border flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-widest">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto py-2">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="size-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={cn(
                    "px-5 py-4 hover:bg-secondary/50 transition-colors cursor-pointer group relative flex gap-4",
                    n.status === "open" && "bg-primary/5"
                  )}
                  onClick={() => handleMarkAsRead(n.id)}
                >
                  <div className="size-8 rounded-full bg-background border border-border flex items-center justify-center shrink-0">
                    {getEventIcon(n.event_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-[11px] font-black uppercase tracking-tight truncate">{getEventTitle(n)}</p>
                      <span className="text-[8px] text-muted-foreground font-bold whitespace-nowrap">
                        {new Date(n.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {n.reason || `Action regarding transaction ${n.creem_transaction_id?.slice(0, 8) || "..."}`}
                    </p>
                  </div>
                  {n.status === "open" && (
                     <div className="size-1.5 bg-primary rounded-full mt-2 shrink-0 shadow-sm shadow-primary/40" />
                  )}
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-5 py-3 bg-secondary/30 border-t border-border text-center">
               <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Showing last 10 events</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
