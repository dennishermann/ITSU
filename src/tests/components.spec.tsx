import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ViewerPanel from '@/components/ViewerPanel';
import GalleryGrid, { Item } from '@/components/GalleryGrid';

describe('ViewerPanel', () => {
  it('shows copy notification when Copy clicked', async () => {
    const item = { id: '1', processed_url: 'https://x/y.png', original_filename: 'test.png' };
    const writeSpy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    render(<ViewerPanel item={item} onCopy={() => {}} onDelete={() => {}} />);
    fireEvent.click(screen.getByText('Copy'));
    expect(writeSpy).toHaveBeenCalled();
    // notification added into DOM
    expect(document.body.textContent).toContain('Copied to clipboard');
  });
});

describe('GalleryGrid', () => {
  const items: Item[] = [
    { id: 'a', processed_url: 'https://x/a.png', original_filename: 'a.png', created_at: 't' },
  ];
  beforeEach(() => {
    vi.spyOn(global as unknown as { fetch: typeof fetch }, 'fetch').mockResolvedValue(new Response(JSON.stringify({ items }), { status: 200 }));
  });
  afterEach(() => {
    (global as unknown as { fetch: typeof fetch }).fetch.mockRestore();
  });

  it('calls onSelect when a card is clicked', async () => {
    const onSelect = vi.fn();
    render(<GalleryGrid onSelect={onSelect} initialId={null} />);
    // wait next tick for load()
    await Promise.resolve();
    const imgButton = document.querySelector('button');
    if (imgButton) fireEvent.click(imgButton);
    expect(onSelect).toHaveBeenCalled();
  });
});


