"use client";
import React from "react";
import Image from "next/image";

export type GalleryCardItem = {
  id: string;
  processed_url: string;
  original_filename: string | null;
  created_at: string;
};

export default function GalleryCard({ item, onView, onCopy, onDelete }: {
  item: GalleryCardItem;
  onView?: (item: GalleryCardItem) => void;
  onCopy?: (url: string) => void;
  onDelete?: (id: string) => void;
}) {
  return (
    <div className="group relative rounded-2xl bg-[#111217] p-2 shadow-sm">
      <button onClick={() => onView?.(item)} className="block w-full">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl ring-1 ring-white/10 transition group-hover:ring-[#7c4dff]">
          <Image
            src={item.processed_url}
            alt={item.original_filename || item.id}
            fill
            sizes="(max-width: 1280px) 33vw, 420px"
            className="object-cover transition duration-200 group-hover:scale-[1.03]"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
            <div className="rounded-b-2xl border border-white/10 bg-black/60 p-2 opacity-100 backdrop-blur-sm transition duration-200 lg:opacity-0 lg:group-hover:opacity-100">
              <div className="pointer-events-auto flex justify-center gap-3">
                <span
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onView?.(item);
                  }}
                  className="cursor-pointer rounded-full border border-[#7c4dff]/50 bg-[#7c4dff]/20 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#7c4dff]/30 lg:px-3 lg:py-1.5 lg:text-xs"
                >
                  View
                </span>
                <span
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    await navigator.clipboard.writeText(item.processed_url);
                    onCopy?.(item.processed_url);
                  }}
                  className="cursor-pointer rounded-full border border-[#7c4dff]/50 bg-[#7c4dff]/20 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#7c4dff]/30 lg:px-3 lg:py-1.5 lg:text-xs"
                >
                  Copy
                </span>
                <span
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete?.(item.id);
                  }}
                  className="cursor-pointer rounded-full border border-red-500/40 bg-red-500/15 px-4 py-2 text-sm font-medium text-red-200 hover:bg-red-500/25 lg:px-3 lg:py-1.5 lg:text-xs"
                >
                  Delete
                </span>
              </div>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}


