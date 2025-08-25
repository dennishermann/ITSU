"use client";
import React, { useEffect, useState } from 'react';
import Hero from '@/components/Hero';
import { Item as GalleryItem } from '@/components/GalleryGrid';
import UploadSection from '@/components/UploadSection';
import LibrarySection from '@/components/LibrarySection';

export default function Page() {
	const [selected, setSelected] = useState<GalleryItem | null>(null);
	const initialSelected = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('view') : null;

	useEffect(() => {
		if (!selected) return;
		const url = new URL(window.location.href);
		url.searchParams.set('view', selected.id);
		history.replaceState({}, '', url.toString());
	}, [selected]);

	return (
		<main className="min-h-screen bg-transparent text-white">
			<div className="mx-auto max-w-[1280px] p-6 lg:p-10">
				<Hero />
				<section id="workbench" className="grid gap-6">
					<UploadSection />
					<LibrarySection selected={selected} setSelected={setSelected} initialSelected={initialSelected} />
				</section>
			</div>
		</main>
	);
}
