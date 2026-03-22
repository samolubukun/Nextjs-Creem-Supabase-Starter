"use client";

import {
  Bot,
  ChevronRight,
  History,
  Loader2,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  updated_at: string;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createSupabaseBrowser();

  // Load Initial Chats and Session
  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: chatList } = await supabase
        .from("chats")
        .select("id, title, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (chatList) setChats(chatList);

      // Start with a fresh chat session by default
      setChatId(null);
      setMessages([]);
      setInitializing(false);
    }

    init();
  }, [supabase.from, supabase.auth.getUser]);

  async function loadMessages(id: string) {
    const { data: history } = await supabase
      .from("chat_messages")
      .select("id, role, content")
      .eq("chat_id", id)
      .order("created_at", { ascending: true });

    if (history) {
      setMessages(
        history.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      );
    }
  }

  async function switchChat(id: string) {
    if (id === chatId) return;
    setInitializing(true);
    setChatId(id);
    await loadMessages(id);
    setInitializing(false);
    setIsSidebarOpen(false);
  }

  function createNewChat() {
    setChatId(null);
    setMessages([]);
    setIsSidebarOpen(false);
  }

  async function deleteChat(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("chats").delete().eq("id", id);
    const updatedChats = chats.filter((c) => c.id !== id);
    setChats(updatedChats);

    if (chatId === id) {
      if (updatedChats.length > 0) {
        switchChat(updatedChats[0].id);
      } else {
        createNewChat();
      }
    }
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const userMessage: Message = { id: `u-${Date.now()}`, role: "user", content: input };
    const draftMessages = [...messages, userMessage];
    setMessages(draftMessages);
    setInput("");
    setLoading(true);

    let activeChatId = chatId;

    // Create a new session if this is the first message
    if (!activeChatId) {
      const title = input.length > 25 ? `${input.substring(0, 25)}...` : input;
      const { data: newChat } = await supabase
        .from("chats")
        .insert({ user_id: user.id, title })
        .select()
        .single();

      if (newChat) {
        activeChatId = newChat.id;
        setChatId(newChat.id);
        setChats((prev) => [newChat, ...prev]);
      } else {
        setLoading(false);
        return;
      }
    } else {
      // Update chat timestamp and bring to top of sidebar
      await supabase
        .from("chats")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", activeChatId);
      setChats((prev) => {
        const existing = prev.find((c) => c.id === activeChatId);
        if (!existing) return prev;
        return [
          { ...existing, updated_at: new Date().toISOString() },
          ...prev.filter((c) => c.id !== activeChatId),
        ];
      });
    }

    // Save User Message to DB
    await supabase.from("chat_messages").insert({
      chat_id: activeChatId,
      user_id: user.id,
      role: "user",
      content: userMessage.content,
    });

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: draftMessages }),
      });

      const data = await response.json();
      const assistantContent = data.error ? `Error: ${data.error}` : data.content;

      const assistantMessage: Message = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: assistantContent,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      await supabase.from("chat_messages").insert({
        chat_id: activeChatId,
        user_id: user.id,
        role: "assistant",
        content: assistantContent,
      });
    } catch (_error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-fallback-${Date.now()}`,
          role: "assistant",
          content: "Failed to connect to the system core.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full border-none shadow-2xl bg-card overflow-hidden flex h-[700px] rounded-[2.5rem] relative">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close chat sidebar"
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "bg-secondary border-r flex flex-col shrink-0 transition-all duration-300 z-50",
          "absolute inset-y-0 left-0 w-[260px] sm:w-[320px]",
          isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        )}
      >
        <div className="p-6 border-b flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">
            Chat Logs
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={createNewChat}
              className="rounded-xl hover:bg-primary/10 text-primary"
              title="New Chat"
            >
              <Plus className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(false)}
              className="rounded-xl hover:bg-slate-200 text-slate-500 lg:hidden"
              title="Close Sidebar"
            >
              <X className="size-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {chats.map((chat) => (
            <button
              type="button"
              key={chat.id}
              onClick={() => switchChat(chat.id)}
              className={cn(
                "w-full p-4 rounded-2xl text-left transition-all group flex items-center gap-3 cursor-pointer",
                chatId === chat.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "hover:bg-background text-muted-foreground hover:text-foreground hover:shadow-sm",
              )}
            >
              <MessageSquare
                className={cn(
                  "size-4 shrink-0",
                  chatId === chat.id ? "text-white" : "text-slate-400 group-hover:text-primary",
                )}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate uppercase tracking-tight">{chat.title}</p>
                <p
                  className={cn(
                    "text-[8px] uppercase font-black opacity-60 mt-0.5",
                    chatId === chat.id ? "text-white" : "text-muted-foreground",
                  )}
                >
                  {new Date(chat.updated_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center shrink-0">
                <ChevronRight
                  className={cn(
                    "size-4 opacity-0 group-hover:opacity-100 transition-all",
                    chatId === chat.id && "opacity-100",
                  )}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "size-6 p-0 hover:bg-destructive/20 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity ml-2",
                    chatId === chat.id && "hover:bg-white/20 text-white",
                  )}
                  onClick={(e) => deleteChat(chat.id, e)}
                  title="Delete Chat"
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background text-foreground">
        <CardHeader className="p-4 md:p-8 pb-4 border-b bg-background flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl bg-secondary border border-border hover:bg-primary/10 hover:text-primary transition-colors shrink-0"
              onClick={() => setIsSidebarOpen(true)}
              title="View Chat History"
            >
              <History className="size-5" />
            </Button>
            <div className="size-10 md:size-12 rounded-xl md:rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 shrink-0">
              <Sparkles className="size-5 md:size-6" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base md:text-xl font-black uppercase tracking-tighter truncate">
                AI Core Assistant
              </CardTitle>
              <CardDescription className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 truncate">
                <span
                  className={cn(
                    "size-1.5 md:size-2 shrink-0 rounded-full bg-success",
                    initializing ? "animate-spin" : "animate-pulse",
                  )}
                />
                <span className="truncate">
                  {initializing ? "Initializing Memory..." : "Online & Synchronized"}
                </span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent
          className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent"
          ref={scrollRef}
        >
          {initializing ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-40">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Accessing secure memory core...
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
              <Bot className="size-16 text-slate-300" />
              <p className="text-sm font-black uppercase tracking-widest text-muted-foreground max-w-xs">
                Memory core empty. Initiate communication protocols to begin.
              </p>
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2",
                  m.role === "user" ? "flex-row-reverse" : "flex-row",
                )}
              >
                <div
                  className={cn(
                    "size-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                    m.role === "user"
                      ? "bg-slate-900 text-white"
                      : "bg-primary/10 text-primary border border-primary/20",
                  )}
                >
                  {m.role === "user" ? <User className="size-5" /> : <Bot className="size-5" />}
                </div>
                <div
                  className={cn(
                    "p-4 md:p-5 rounded-[1.5rem] text-sm font-medium leading-relaxed max-w-[85%] md:max-w-[80%] shadow-sm break-words whitespace-pre-wrap overflow-hidden",
                    m.role === "user"
                      ? "bg-foreground text-background rounded-tr-none"
                      : "bg-secondary text-foreground border border-border rounded-tl-none",
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))
          )}
          {loading && (
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
          )}
        </CardContent>

        <div className="p-4 md:p-8 bg-secondary border-t shrink-0">
          <form onSubmit={handleSend} className="relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the AI Assistant..."
              className="h-16 pl-6 pr-20 rounded-2xl border-2 border-border bg-background focus:border-primary transition-all font-bold placeholder:font-black placeholder:uppercase placeholder:tracking-widest placeholder:text-[10px]"
              disabled={loading || initializing}
            />
            <Button
              type="submit"
              disabled={loading || !input.trim() || initializing}
              className="absolute right-2 top-2 h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 text-white transition-all shadow-lg shadow-primary/20"
            >
              <Send className="size-5" />
            </Button>
          </form>
        </div>
      </div>
    </Card>
  );
}
