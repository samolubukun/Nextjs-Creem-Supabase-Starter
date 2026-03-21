import Link from "next/link";
import { Github } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="py-12 md:py-20 border-t bg-gradient-to-b from-slate-950 to-[#1a0f0a] text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col items-center">
        <div className="flex flex-row justify-center items-center gap-6 md:gap-12 text-[10px] md:text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-8 md:mb-12 w-full overflow-hidden truncate">
          <Link href="/pricing" className="hover:text-primary transition-colors whitespace-nowrap">Pricing</Link>
          <Link href="/blog" className="hover:text-primary transition-colors whitespace-nowrap">Blog</Link>

          <a href="https://github.com/samuel-olubukun/Nextjs-Creem-Starter" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center whitespace-nowrap">
            <Github className="size-4 mr-2" /> Github
          </a>
        </div>
        
        <span className="text-xl font-black tracking-tighter uppercase mb-4 block">SAASXCREEM</span>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest text-center">
          Built with Next.js, Supabase & <a href="https://creem.io" className="text-primary/50 font-black hover:text-primary transition-colors">Creem</a>
        </p>
        <p className="mt-8 text-slate-600 text-[8px] font-black uppercase tracking-[0.3em] text-center">
          Designed and developed by <a href="https://samuelolubukun.netlify.app/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">Samuel Olubukun</a>
        </p>
      </div>
    </footer>
  );
}
