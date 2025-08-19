## Image Transformation Service

Upload an image → remove background → flip horizontally → host publicly and get a unique URL. Anonymous ownership via `sid` cookie, with TTL auto-delete.

Live URL: <to be filled after Vercel deploy>

### Architecture

```
Browser → /api/upload → (remove.bg → ClipDrop → flip with sharp) → Supabase Storage (public)
         → DB row → UI shows processed URL
/api/images (list by sid)
/api/images/:id DELETE (verify sid)
TTL: 7 days via cron + lazy cleanup
```

### Environment variables

See `.env.example` and set them for Development, Preview, and Production.

### API examples

```bash
curl -F file=@/path/img.jpg https://<domain>/api/upload
curl https://<domain>/api/images
curl -X DELETE https://<domain>/api/images/<id>
```

### Notes

- If cookies are cleared, prior uploads aren’t manageable from the UI; direct URLs work until TTL.
- Public bucket chosen for demo; production should enable RLS and use signed URLs or a private bucket.
- Background removal might be unavailable when credits are exhausted; the UI will warn and perform flip-only.

### Future work

OAuth, signed URLs/private bucket, stricter rate limiting, queues & progress, retries/backoff, dimension caps, audit logs.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
