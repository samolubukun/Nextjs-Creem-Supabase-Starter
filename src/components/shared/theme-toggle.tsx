"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="p-2 size-10" />;

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const getIcon = () => {
    if (theme === "light") return <Sun className="size-5" />;
    if (theme === "dark") return <Moon className="size-5" />;
    return <Monitor className="size-5" />;
  };

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded-full hover:bg-muted transition-colors flex items-center justify-center relative overflow-hidden group border border-transparent hover:border-border"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ y: 20, opacity: 0, rotate: -45 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -20, opacity: 0, rotate: 45 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          {getIcon()}
        </motion.div>
      </AnimatePresence>
      
      {/* Tooltip hint on hover */}
      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border shadow-sm">
        {theme === 'system' ? 'System Theme' : theme === 'light' ? 'Light Mode' : 'Dark Mode'}
      </span>
    </button>
  );
}
