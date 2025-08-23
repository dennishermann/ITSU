"use client";
import React from "react";
import GalleryGrid, { Item as GalleryItem } from "./GalleryGrid";
import ViewerPanel from "./ViewerPanel";

export default function LibrarySection({
  selected,
  setSelected,
  initialSelected,
}: {
  selected: GalleryItem | null;
  setSelected: (it: GalleryItem | null) => void;
  initialSelected: string | null;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111217] p-4 shadow-sm text-white">
      <h2 className="mb-2 text-lg font-semibold">
        Your Library <span className="text-white/50 text-sm">(auto-deletes after 7 days)</span>
      </h2>
      <div className="mb-4 flex items-center justify-between text-sm text-white/70"></div>
      <div className="grid grid-cols-[minmax(740px,1fr)_440px] gap-6">
        <GalleryGrid
          onSelect={(it) => setSelected(it)}
          initialId={initialSelected}
          onCopy={() => {
            const el = document.createElement('div');
            el.className = 'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/70 px-4 py-2 text-sm text-white shadow-lg backdrop-blur-sm';
            el.textContent = 'Copied to clipboard';
            document.body.appendChild(el);
            setTimeout(() => { document.body.removeChild(el); }, 2000);
          }}
          onDeleted={(id) => {
            if (selected?.id === id) {
              setSelected(null);
              const url = new URL(window.location.href);
              url.searchParams.delete("view");
              history.replaceState({}, "", url.toString());
            }
          }}
        />
        <ViewerPanel
          item={selected ? { id: selected.id, processed_url: selected.processed_url, original_filename: selected.original_filename } : null}
          onCopy={(u) => {
            navigator.clipboard.writeText(u);
            try {
              window.dispatchEvent(new CustomEvent("app:toast-bottom", { detail: "Copied URL" }));
            } catch {}
          }}
          onDelete={async (id) => {
            await fetch(`/api/images/${id}`, { method: "DELETE" });
            window.dispatchEvent(new Event("images:refresh"));
            setSelected(null);
          }}
        />
      </div>
    </div>
  );
}


