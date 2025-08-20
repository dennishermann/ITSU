## Image Transformation Service

Upload an image → remove background → flip horizontally → host publicly and get a unique URL.
 
Anonymous ownership via `sid` cookie, with TTL auto-delete.

Live URL: https://itsu-five.vercel.app/

### Architecture

```
Browser → /api/upload → (remove.bg → ClipDrop → flip with sharp) → Supabase Storage (public)
         → DB row → UI shows processed URL
/api/images (list by sid)
/api/images/:id DELETE (verify sid)
TTL: 7 days via cron + lazy cleanup
```

### Environment variables

See `.env.example` and set them for Development, Preview, and Production:

Required
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CLEANUP_TOKEN`
- `NEXT_PUBLIC_SITE_URL`

Optional (background removal)
- `BG_REMOVE_API_KEY` (remove.bg)
- `CLIPDROP_API_KEY` (ClipDrop)
- `TTL_DAYS` (default 7)

### API examples

```bash
curl -F file=@/path/img.jpg https://<domain>/api/upload
curl https://<domain>/api/images
curl -X DELETE https://<domain>/api/images/<id>
```

Response example (201):

```json
{ "id": "uuid", "processedUrl": "https://...", "bgProvider": "removebg|clipdrop|none" }
```

### Notes

- If cookies are cleared, prior uploads aren’t manageable from the UI; direct URLs work until TTL.
- Background removal might be unavailable when credits are exhausted; the UI will warn and perform flip-only.

### UI & behavior

- Drag-and-drop or click-to-browse single file upload
- Busy state during processing; result card with Open and Copy URL
- “My Images” lists your uploads for the current browser (anonymous `sid`)
- If `bgProvider === 'none'`, the UI shows a muted warning

### Logging & troubleshooting

- Server logs include a per-request ID and non-sensitive step logs (provider chosen, errors per step)
- No credentials are logged

### Getting started (local)

```bash
npm i
cp .env.example .env.local
# fill required envs
npm run dev
```

### Deployment (Vercel)

- Import the repo, set the same envs for Development/Preview/Production, and deploy