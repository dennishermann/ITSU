"use client";
import React, { useCallback, useEffect, useState } from "react";
import GalleryCard, { GalleryCardItem } from './GalleryCard';

export type Item = { id: string; processed_url: string; original_filename: string | null; created_at: string };

export default function GalleryGrid({ onSelect, initialId, onDeleted, onCopy }: { onSelect?: (item: Item) => void; initialId?: string | null; onDeleted?: (id: string) => void; onCopy?: (url: string) => void }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/images");
      const body = (await res.json()) as { items: Item[] };
      setItems(body.items);
      if (initialId) {
        const found = body.items.find((i) => i.id === initialId);
        if (found) onSelect?.(found);
      }
    } finally {
      setLoading(false);
    }
  }, [initialId, onSelect]);

  useEffect(() => {
    load();
    const re = () => load();
    window.addEventListener("images:refresh", re);
    return () => window.removeEventListener("images:refresh", re);
  }, [load]);

  async function onDelete(id: string) {
    await fetch(`/api/images/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
    onDeleted?.(id);
  }


  if (loading) return <p className="text-sm text-neutral-400">Loading…</p>;
  if (items.length === 0) return <p className="text-sm text-neutral-400">No images yet.</p>;

  return (
    <div className="grid grid-cols-3 gap-6">
      {items.map((it) => (
        <GalleryCard
          key={it.id}
          item={it as GalleryCardItem}
          onView={(item) => onSelect?.(item)}
          onCopy={(url) => onCopy?.(url)}
          onDelete={(id) => onDelete(id)}
        />
      ))}
    </div>
  );
}


