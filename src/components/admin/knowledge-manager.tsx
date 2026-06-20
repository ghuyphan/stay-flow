"use client";

import { Check, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ButtonSkeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { StoredKnowledgeItem } from "@/server/repositories/app-repository";

const emptyItem = (): StoredKnowledgeItem => ({
  id: `draft-${crypto.randomUUID()}`,
  titleEn: "New support answer",
  titleVi: "Câu trả lời mới",
  contentEn: "",
  contentVi: "",
  enabled: true,
});

export function KnowledgeManager({ initialItems }: { initialItems: StoredKnowledgeItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  function updateItem(id: string, changes: Partial<StoredKnowledgeItem>) {
    setStatus("idle");
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...changes } : item)));
  }

  async function save() {
    setStatus("saving");
    setError("");
    const response = await fetch("/api/settings/knowledge", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(items),
    });
    const result = (await response.json()) as StoredKnowledgeItem[] | { error?: string };
    if (!response.ok) {
      setStatus("error");
      setError(Array.isArray(result) ? "Không thể lưu kiến thức AI." : result.error ?? "Không thể lưu kiến thức AI.");
      return;
    }
    setItems(result as StoredKnowledgeItem[]);
    setStatus("saved");
    window.setTimeout(() => setStatus("idle"), 1600);
  }

  return (
    <div className="mt-5 grid gap-4">
      <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <p className="font-semibold">Câu trả lời đã duyệt</p>
          <p className="mt-1 text-sm text-muted-foreground">Các nội dung này dùng cho chatbot hỗ trợ khách bằng tiếng Anh và tiếng Việt.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setItems((current) => [...current, emptyItem()])}>
            <Plus className="size-4" /> Thêm câu trả lời
          </Button>
          {status === "saving" ? (
            <ButtonSkeleton className="w-32" />
          ) : (
            <Button onClick={save}>
              {status === "saved" ? <Check className="size-4" /> : null}
              {status === "saved" ? "Đã xuất bản" : "Xuất bản"}
            </Button>
          )}
        </div>
      </Card>

      {items.map((item) => (
        <Card key={item.id} className="p-4">
          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={item.enabled}
                onChange={(event) => updateItem(item.id, { enabled: event.target.checked })}
                className="size-4 accent-[var(--color-primary)]"
              />
              Đang bật
            </label>
            <button
              type="button"
              aria-label={`Xóa ${item.titleVi || item.titleEn}`}
              onClick={() => setItems((current) => current.filter((candidate) => candidate.id !== item.id))}
              className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </button>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <KnowledgeLocaleFields
              label="Tiếng Anh"
              title={item.titleEn}
              content={item.contentEn}
              onTitleChange={(titleEn) => updateItem(item.id, { titleEn })}
              onContentChange={(contentEn) => updateItem(item.id, { contentEn })}
            />
            <KnowledgeLocaleFields
              label="Tiếng Việt"
              title={item.titleVi}
              content={item.contentVi}
              onTitleChange={(titleVi) => updateItem(item.id, { titleVi })}
              onContentChange={(contentVi) => updateItem(item.id, { contentVi })}
            />
          </div>
        </Card>
      ))}

      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

function KnowledgeLocaleFields({
  label,
  title,
  content,
  onTitleChange,
  onContentChange,
}: {
  label: string;
  title: string;
  content: string;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <input
        value={title}
        onChange={(event) => onTitleChange(event.target.value)}
        className="mt-2 min-h-11 w-full rounded-[var(--radius-md)] border bg-background px-3 text-sm font-semibold outline-none focus:border-ring"
      />
      <Textarea
        value={content}
        onChange={(event) => onContentChange(event.target.value)}
        rows={5}
        className="mt-3"
        placeholder={`Câu trả lời ${label.toLowerCase()}`}
      />
    </div>
  );
}
