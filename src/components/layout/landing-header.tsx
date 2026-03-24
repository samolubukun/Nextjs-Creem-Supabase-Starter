"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Github, Menu, X } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";

export function LandingHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl md:text-2xl font-black tracking-tighter text-foreground uppercase"
        >
          SAASXCREEM
        </Link>

        <div className="flex items-center gap-4">
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/pricing"
              className="text-xs font-black text-foreground hover:text-primary uppercase tracking-widest transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/blog"
              className="text-xs font-black text-foreground hover:text-primary uppercase tracking-widest transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/login"
              className="text-xs font-black text-foreground hover:text-primary uppercase tracking-widest transition-colors"
            >
              Sign In
            </Link>
            <Button
              asChild
              size="default"
              className="bg-foreground text-background hover:bg-muted-foreground h-10 px-6 rounded-full ml-2"
            >
              <a
                href="https://github.com/samolubukun/Nextjs-Creem-Supabase-Starter"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="size-4 mr-2" strokeWidth={3} /> Github
              </a>
            </Button>
            <ThemeToggle />
          </nav>

          {/* Mobile Nav Toggle */}
          <div className="flex md:hidden items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="size-10 rounded-full"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden border-b bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              <Link
                href="/pricing"
                className="text-lg font-black uppercase tracking-widest py-2 border-b border-border/50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/blog"
                className="text-lg font-black uppercase tracking-widest py-2 border-b border-border/50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                href="/login"
                className="text-lg font-black uppercase tracking-widest py-2 border-b border-border/50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <div className="flex items-center justify-between py-2">
                <span className="text-lg font-black uppercase tracking-widest text-muted-foreground">
                  Appearance
                </span>
                <ThemeToggle />
              </div>
              <Button
                asChild
                size="lg"
                className="w-full bg-foreground text-background hover:bg-muted rounded-xl mt-2"
              >
                <a
                  href="https://github.com/samolubukun/Nextjs-Creem-Supabase-Starter"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center font-black uppercase tracking-tighter"
                >
                  <Github className="size-5 mr-3" strokeWidth={3} /> Github
                </a>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
