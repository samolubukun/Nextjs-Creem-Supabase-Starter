import type { Meta, StoryObj } from "@storybook/nextjs";
import { Bot, Loader2, Sparkles, User } from "lucide-react";
import { ChatInterface } from "@/components/chat/chat-interface";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const meta = {
  title: "Chat/ChatInterface",
  component: ChatInterface,
  decorators: [
    (Story) => (
      <div className="p-6 max-w-2xl mx-auto">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithMessages: Story = {
  decorators: [
    (Story) => (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="w-full border-none shadow-2xl bg-card overflow-hidden flex h-[700px] rounded-[2.5rem] relative">
          <div className="flex-1 flex flex-col min-w-0 bg-background text-foreground">
            <CardHeader className="p-4 md:p-8 pb-4 border-b bg-background flex flex-row items-center justify-between shrink-0">
              <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                <div className="size-10 md:size-12 rounded-xl md:rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 shrink-0">
                  <Sparkles className="size-5 md:size-6" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-base md:text-xl font-black uppercase tracking-tighter truncate">
                    AI Core Assistant
                  </CardTitle>
                  <CardDescription className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 truncate">
                    <span className="size-1.5 md:size-2 shrink-0 rounded-full bg-success animate-pulse" />
                    Online & Synchronized
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="size-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm bg-slate-900 text-white">
                  <User className="size-5" />
                </div>
                <div className="p-4 md:p-5 rounded-[1.5rem] text-sm font-medium leading-relaxed max-w-[85%] bg-foreground text-background rounded-tr-none shadow-sm">
                  What are the best practices for API rate limiting?
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="size-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm bg-primary/10 text-primary border border-primary/20">
                  <Bot className="size-5" />
                </div>
                <div className="p-4 md:p-5 rounded-[1.5rem] text-sm font-medium leading-relaxed max-w-[85%] bg-secondary border border-border rounded-tl-none shadow-sm">
                  Here are the key best practices for API rate limiting:{"\n\n"}1. **Use a
                  distributed rate limiter** like Upstash Redis{"\n"}2. **Implement token bucket or
                  sliding window algorithms**{"\n"}3. **Return proper 429 headers** with Retry-After
                  {"\n"}4. **Graceful degradation** for exceeded limits
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="size-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm bg-slate-900 text-white">
                  <User className="size-5" />
                </div>
                <div className="p-4 md:p-5 rounded-[1.5rem] text-sm font-medium leading-relaxed max-w-[85%] bg-foreground text-background rounded-tr-none shadow-sm">
                  Show me a code example
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="size-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm bg-primary/10 text-primary border border-primary/20">
                  <Bot className="size-5" />
                </div>
                <div className="p-4 md:p-5 rounded-[1.5rem] text-sm font-medium leading-relaxed max-w-[85%] bg-secondary border border-border rounded-tl-none shadow-sm font-mono">
                  const limiter = new Ratelimit({"{"} {"}"}
                  {"\n"} redis: Redis.fromEnv(),{"\n"} limiter: Ratelimit.slidingWindow(10, "10 s"),
                  {"\n"}
                  {"}"});{"\n"}
                </div>
              </div>
            </CardContent>
          </div>
        </div>
      </div>
    ),
  ],
};

export const Loading: Story = {
  decorators: [
    (Story) => (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="w-full border-none shadow-2xl bg-card overflow-hidden flex h-[700px] rounded-[2.5rem] relative">
          <div className="flex-1 flex flex-col min-w-0 bg-background text-foreground">
            <CardHeader className="p-4 md:p-8 pb-4 border-b bg-background flex flex-row items-center justify-between shrink-0">
              <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                <div className="size-10 md:size-12 rounded-xl md:rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 shrink-0">
                  <Sparkles className="size-5 md:size-6" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-base md:text-xl font-black uppercase tracking-tighter truncate">
                    AI Core Assistant
                  </CardTitle>
                  <CardDescription className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 truncate">
                    <span className="size-1.5 md:size-2 shrink-0 rounded-full bg-success animate-pulse" />
                    Online & Synchronized
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="size-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm bg-slate-900 text-white">
                  <User className="size-5" />
                </div>
                <div className="p-4 md:p-5 rounded-[1.5rem] text-sm font-medium leading-relaxed max-w-[85%] bg-foreground text-background rounded-tr-none shadow-sm">
                  Explain how Next.js caching works
                </div>
              </div>
              <div className="flex items-start gap-4 animate-pulse">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <Loader2 className="size-5 animate-spin" />
                </div>
                <div className="p-5 rounded-[1.5rem] bg-secondary border border-border rounded-tl-none">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Synthesizing...
                  </span>
                </div>
              </div>
            </CardContent>
          </div>
        </div>
      </div>
    ),
  ],
};
