"use client";
import React, { useEffect, useRef, useState } from 'react';

export default function Page() {
	const [toast, setToast] = useState<string | null>(null);
	const toastTimer = useRef<number | null>(null);
	const [bottomToast, setBottomToast] = useState<string | null>(null);
	const bottomToastTimer = useRef<number | null>(null);

	useEffect(() => {
		const handler = (ev: Event) => {
			const e = ev as unknown as CustomEvent<string>;
			setToast(e.detail || 'Done');
			if (toastTimer.current) window.clearTimeout(toastTimer.current);
			toastTimer.current = window.setTimeout(() => setToast(null), 5000);
		};
		window.addEventListener('app:toast', handler as EventListener);

		const bottomHandler = (ev: Event) => {
			const e = ev as unknown as CustomEvent<string>;
			setBottomToast(e.detail || 'Done');
			if (bottomToastTimer.current) window.clearTimeout(bottomToastTimer.current);
			bottomToastTimer.current = window.setTimeout(() => setBottomToast(null), 5000);
		};
		window.addEventListener('app:toast-bottom', bottomHandler as EventListener);
		return () => {
			window.removeEventListener('app:toast', handler as EventListener);
			window.removeEventListener('app:toast-bottom', bottomHandler as EventListener);
			if (toastTimer.current) window.clearTimeout(toastTimer.current);
			if (bottomToastTimer.current) window.clearTimeout(bottomToastTimer.current);
		};
	}, []);

	return (
		<main className="min-h-screen bg-neutral-50 text-neutral-900">
			<div className="mx-auto max-w-3xl p-6 lg:p-10">
				<header className="mb-8 text-center">
					<h1 className="text-3xl font-bold tracking-tight">Image Transformation Service</h1>
					<p className="text-neutral-600">Upload an image → remove background → flip → get a link.</p>
				</header>
				<section className="grid gap-6">
					<div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
						<h2 className="mb-2 text-lg font-semibold">Upload</h2>
						<UploadCard />
					</div>
					{toast && (
						<div role="status" aria-live="polite" className="rounded-lg bg-black px-4 py-2 text-sm text-white shadow-sm">
							{toast}
						</div>
					)}
					<div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
						<h2 className="mb-2 text-lg font-semibold">My Images</h2>
						<ImagesList />
					</div>
					{bottomToast && (
						<div role="status" aria-live="polite" className="rounded-lg bg-black px-4 py-2 text-sm text-white shadow-sm">
							{bottomToast}
						</div>
					)}
				</section>
			</div>
		</main>
	);
}

function Spinner() {
	return (
		<svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
			<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
			<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
		</svg>
	);
}

function UploadCard() {
	'use client';
	const [file, setFile] = useState<File | null>(null);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [dragActive, setDragActive] = useState(false);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const inputRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		if (!file) {
			if (previewUrl) URL.revokeObjectURL(previewUrl);
			setPreviewUrl(null);
			return;
		}
		const url = URL.createObjectURL(file);
		setPreviewUrl(url);
		return () => URL.revokeObjectURL(url);
	}, [file]);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!file) return;
		setError(null);
		setBusy(true);
		// keep preview while processing
		try {
			const data = new FormData();
			data.append('file', file);
			const res = await fetch('/api/upload', { method: 'POST', body: data });
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				throw new Error(body.error || `Upload failed (${res.status})`);
			}
			const body = (await res.json()) as { id: string; processedUrl: string; bgProvider: 'removebg' | 'clipdrop' | 'none' };
			// Reset selection, refresh list, and show a toast
			setFile(null);
			if (inputRef.current) inputRef.current.value = '';
			try { window.dispatchEvent(new Event('images:refresh')); } catch {}
			try { window.dispatchEvent(new CustomEvent('app:toast', { detail: 'Image processed successfully' })); } catch {}
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : 'Something went wrong');
		} finally {
			setBusy(false);
		}
	}

	return (
		<>
		<form onSubmit={onSubmit} className="grid gap-3">
			{!file ? (
				<div
					onDragOver={(e) => {
						e.preventDefault();
						setDragActive(true);
					}}
					onDragLeave={() => setDragActive(false)}
					onDrop={(e) => {
						e.preventDefault();
						setDragActive(false);
						const f = e.dataTransfer.files?.[0];
						if (f) setFile(f);
					}}
					role="button"
					aria-label="Drag and drop image or click to browse"
					onClick={() => inputRef.current?.click()}
					className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center ${dragActive ? 'border-black bg-neutral-50' : 'border-neutral-300 hover:border-neutral-400'}`}
				>
					<div className="text-sm text-neutral-700">Drag and drop an image here, or click to select</div>
					<div className="text-xs text-neutral-500">PNG, JPEG, or WebP, up to 10 MB</div>
					<input
						ref={inputRef}
						aria-label="Image file"
						type="file"
						accept="image/png,image/jpeg,image/webp"
						onChange={(e) => setFile(e.target.files?.[0] || null)}
						className="hidden"
					/>
				</div>
			) : (
				<div className="flex items-center justify-between gap-3 rounded-xl border p-3">
					<div className="flex items-center gap-3">
						{previewUrl && <img src={previewUrl} alt={file.name} className="h-20 w-20 rounded object-cover" />}
						<p className="text-sm text-neutral-700">{file.name}</p>
					</div>
					<button
						type="button"
						onClick={() => { setFile(null); if (inputRef.current) inputRef.current.value=''; }}
						className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50"
						disabled={busy}
					>
						Cancel
					</button>
				</div>
			)}
			<button
				disabled={!file || busy}
				type="submit"
				className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-white hover:bg-neutral-800 disabled:opacity-50"
			>
				{busy ? (
					<span className="inline-flex items-center gap-2"><Spinner /> Processing…</span>
				) : (
					<span>Upload & Transform</span>
				)}
			</button>
			{error && <p className="text-sm text-red-600">{error}</p>}
			{/* Result preview intentionally hidden; the list below updates immediately */}
		</form>
		</>
	);
}

function ImagesList() {
	'use client';
	const [items, setItems] = useState<Array<{ id: string; processed_url: string; original_filename: string | null; created_at: string }>>([]);
	const [loading, setLoading] = useState(true);

	async function load() {
		setLoading(true);
		try {
			const res = await fetch('/api/images');
			const body = (await res.json()) as { items: Array<{ id: string; processed_url: string; original_filename: string | null; created_at: string }> };
			setItems(body.items);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		load();
		const listener = () => load();
		window.addEventListener('images:refresh', listener);
		return () => window.removeEventListener('images:refresh', listener);
	}, []);

	async function onDelete(id: string) {
		await fetch(`/api/images/${id}`, { method: 'DELETE' });
		setItems((prev) => prev.filter((i) => i.id !== id));
		try { window.dispatchEvent(new CustomEvent('app:toast-bottom', { detail: 'Image deleted successfully' })); } catch {}
	}

	if (loading) return <p className="text-sm text-neutral-600">Loading…</p>;

	if (items.length === 0) return <p className="text-sm text-neutral-600">No images yet.</p>;

	return (
		<ul className="divide-y">
			{items.map((it) => (
				<li key={it.id} className="flex items-center justify-between gap-3 py-3">
					<div className="flex items-center gap-3">
						<img src={it.processed_url} alt={it.original_filename || it.id} className="h-16 w-16 rounded object-cover" />
						<div>
							<p className="text-sm font-medium">{it.original_filename || it.id}</p>
							<p className="text-xs text-neutral-500">{new Date(it.created_at).toLocaleString()}</p>
						</div>
					</div>
					<div className="flex gap-2">
						<a href={it.processed_url} target="_blank" rel="noreferrer" className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50">Open</a>
						<button
							onClick={async () => {
								await navigator.clipboard.writeText(it.processed_url);
								alert('Copied URL');
							}}
							className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50"
						>
							Copy URL
						</button>
						<button onClick={() => onDelete(it.id)} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50">Delete</button>
					</div>
				</li>
			))}
		</ul>
	);
}
