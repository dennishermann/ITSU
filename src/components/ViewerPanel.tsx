"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from 'next/image';

type Props = {
  item?: { id: string; processed_url: string; original_filename: string | null } | null;
  onCopy?: (url: string) => void;
  onDelete?: (id: string) => void;
};

export default function ViewerPanel({ item, onCopy, onDelete }: Props) {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  useEffect(() => { setScale(1); setTranslate({ x: 0, y: 0 }); }, [item?.id]);
  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    setScale((s) => Math.min(5, Math.max(0.2, s + (e.deltaY > 0 ? -0.1 : 0.1))));
  }
  const dragging = useRef(false); const last = useRef({ x: 0, y: 0 });
  return (
    <div className="relative rounded-2xl border border-white/10 bg-[#111217] p-3 text-white">
      <div className="mb-3 flex items-center justify-between">
        <div className="truncate text-base font-semibold sm:text-lg">Viewer</div>
        <div className="flex gap-2" />
      </div>
      {item && (
        <div className="pointer-events-none absolute right-3 top-3 z-20">
          <div className="pointer-events-auto flex gap-2">
            <button
              onClick={async () => { await navigator.clipboard.writeText(item.processed_url); onCopy?.(item.processed_url); const el = document.createElement('div'); el.className = 'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/70 px-4 py-2 text-sm text-white shadow-lg backdrop-blur-sm'; el.textContent = 'Copied to clipboard'; document.body.appendChild(el); setTimeout(()=>{ try{document.body.removeChild(el);}catch{} },2000); }}
              className="rounded-full border border-[#7c4dff]/50 bg-[#7c4dff]/20 px-4 py-2 text-sm font-medium text-white hover:bg-[#7c4dff]/30 sm:px-3 sm:py-1.5 sm:text-xs">
              Copy
            </button>
            <button
              onClick={() => { window.open(item.processed_url, '_blank'); }}
              className="rounded-full border border-[#7c4dff]/50 bg-[#7c4dff]/20 px-4 py-2 text-sm font-medium text-white hover:bg-[#7c4dff]/30 sm:px-3 sm:py-1.5 sm:text-xs">
              Download
            </button>
            <button
              onClick={() => onDelete?.(item.id)}
              className="rounded-full border border-red-500/40 bg-red-500/15 px-4 py-2 text-sm font-medium text-red-200 hover:bg-red-500/25 sm:px-3 sm:py-1.5 sm:text-xs">
              Delete
            </button>
          </div>
        </div>
      )}
      {!item ? (
        <div className="flex h-[420px] items-center justify-center rounded-xl border border-white/10 bg-black/20 text-sm text-white/60">Select an image to view</div>
      ) : (
        <div
          className="relative h-[60vh] select-none overflow-hidden rounded-xl bg-[linear-gradient(45deg,rgba(0,0,0,.35)_25%,transparent_25%),linear-gradient(-45deg,rgba(0,0,0,.35)_25%,transparent_25%),linear-gradient(45deg,transparent_75%,rgba(0,0,0,.35)_75%),linear-gradient(-45deg,transparent_75%,rgba(0,0,0,.35)_75%)] bg-[length:24px_24px] bg-[position:0_0,0_12px,12px_-12px,-12px_0] sm:h-[420px]"
          onWheel={onWheel}
          onPointerDown={(e) => { dragging.current = true; last.current = { x: e.clientX, y: e.clientY }; }}
          onPointerMove={(e) => { if (!dragging.current) return; setTranslate((t) => ({ x: t.x + e.clientX - last.current.x, y: t.y + e.clientY - last.current.y })); last.current = { x: e.clientX, y: e.clientY }; }}
          onPointerUp={() => { dragging.current = false; }}
        >
          <Image src={item.processed_url} alt={item.original_filename || item.id} fill sizes="440px" style={{ transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`, transformOrigin: 'center center' }} className="pointer-events-none object-contain" />
          <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-center justify-between">
            <div className="rounded-md bg-black/50 px-2 py-1 text-xs text-white/80 backdrop-blur-sm">Zoom: {(scale*100).toFixed(0)}%</div>
            <div className="pointer-events-auto flex gap-2">
              <button onClick={() => setScale((s)=>Math.max(0.2,s-0.2))} className="rounded-md border border-white/10 px-2 py-1 text-sm hover:bg-white/10">-</button>
              <button onClick={()=>{setScale(1);setTranslate({x:0,y:0});}} className="rounded-md border border-white/10 px-2 py-1 text-sm hover:bg-white/10">Fit</button>
              <button onClick={() => setScale((s)=>Math.min(5,s+0.2))} className="rounded-md border border-white/10 px-2 py-1 text-sm hover:bg-white/10">+</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


