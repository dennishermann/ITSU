"use client";
import React, { useEffect, useRef, useState } from "react";

function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
    </svg>
  );
}

export default function UploadCard() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const prevUrlRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    if (!file) {
      setPreviewUrl(null);
      prevUrlRef.current = null;
      return;
    }
    const url = URL.createObjectURL(file);
    prevUrlRef.current = url;
    setPreviewUrl(url);
    return () => {
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    };
  }, [file]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: data });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Upload failed (${res.status})`);
      }
      await res.json();
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      try { window.dispatchEvent(new Event("images:refresh")); } catch {}
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); const f = e.dataTransfer.files?.[0]; if (f) setFile(f); }}
          role="button"
          aria-label="Drag and drop image or click to browse"
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center ${dragActive ? 'border-[#ff4ecd]/70 bg-black/30' : 'border-[#7c4dff]/60 hover:border-[#ff4ecd]/70'}`}
        >
          <div className="text-sm text-neutral-700">Drag and drop an image here, or click to select</div>
          <div className="text-xs text-neutral-500">PNG, JPEG, or WebP, up to 10 MB</div>
          <input ref={inputRef} aria-label="Image file" type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-[#7c4dff]/60 p-3">
          <div className="flex items-center gap-3">
            {previewUrl && <img src={previewUrl} alt={file.name} className="h-20 w-20 rounded object-cover" />}
            <p className="text-sm text-white/80">{file.name}</p>
          </div>
          <button type="button" onClick={() => { setFile(null); if (inputRef.current) inputRef.current.value = ""; }} className="rounded-lg border border-[#7c4dff]/60 px-3 py-1.5 text-sm text-white hover:bg-[#7c4dff]/10" disabled={busy}>Cancel</button>
        </div>
      )}
      <button disabled={!file || busy} type="submit" className="inline-flex w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-[#7c4dff] to-[#ff4ecd] px-5 py-3 text-base font-semibold text-white shadow-sm ring-1 ring-white/10 transition-colors hover:from-[#8b5dff] hover:to-[#ff6ae0] focus:outline-none focus:ring-2 focus:ring-[#ff4ecd]/40 disabled:cursor-not-allowed disabled:opacity-50">
        {busy ? (<span className="inline-flex items-center gap-2"><Spinner /> Processing…</span>) : (<span>Upload & Transform</span>)}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}


