"use client";

import { Bot, MessageCircle, Send, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/components/language-provider";

type Message = { role: "assistant" | "user"; content: string };

export function AIChatWidget() {
  const { language, t } = useLanguage();
  const initialMessage = t("ai.initial");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const visibleMessages = messages.length ? messages : [{ role: "assistant" as const, content: initialMessage }];

  async function send(event: React.FormEvent) {
    event.preventDefault();
    const content = message.trim();
    if (!content || loading) return;
    setMessage("");
    setMessages((current) => [...current, { role: "user", content }]);
    setLoading(true);
    const response = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: content, language }),
    });
    const result = (await response.json()) as { reply?: string };
    setLoading(false);
    setMessages((current) => [
      ...current,
      { role: "assistant", content: result.reply ?? t("ai.error") },
    ]);
  }

  return (
    <div className="fixed bottom-5 right-5 z-[70]">
      {open ? (
        <section
          aria-label="StayFlow support chat"
          className="mb-3 flex h-[min(560px,calc(100vh-110px))] w-[min(370px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-md)] ring-1 ring-black/[0.04]"
        >
          <header className="flex items-center gap-3 bg-muted/35 px-4 py-3">
            <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground"><Bot className="size-4" /></span>
            <div className="flex-1"><p className="text-sm font-semibold">{t("ai.title")}</p><p className="text-xs text-muted-foreground">{t("ai.subtitle")}</p></div>
            <button aria-label="Close support chat" onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-full hover:bg-muted"><X className="size-4" /></button>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {visibleMessages.map((item, index) => (
              <p
                key={index}
                className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 text-sm leading-5 ${
                  item.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {item.content}
              </p>
            ))}
            {loading ? (
              <div className="max-w-[86%] rounded-2xl bg-muted px-3.5 py-3">
                <Skeleton className="h-3 w-32 bg-muted-foreground/20" />
                <Skeleton className="mt-2 h-3 w-20 bg-muted-foreground/20" />
              </div>
            ) : null}
          </div>
          <form onSubmit={send} className="flex gap-2 bg-muted/25 p-3">
            <Input value={message} onChange={(event) => setMessage(event.target.value)} placeholder={t("ai.placeholder")} aria-label="Support message" />
            <Button type="submit" size="sm" aria-label="Send message"><Send className="size-4" /></Button>
          </form>
        </section>
      ) : null}
      <button
        type="button"
        aria-label={open ? "Close support chat" : "Open support chat"}
        onClick={() => setOpen((value) => !value)}
        className="ml-auto grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-md)] transition hover:scale-105"
      >
        {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
      </button>
    </div>
  );
}
