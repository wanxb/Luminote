# Luminote Architecture Notes

## Workspace

* `app/`: Next.js App Router pages
* `components/`: UI modules for gallery, lightbox and upload
* `lib/`: shared front-end utilities and mock data
* `worker/`: Cloudflare Worker API scaffold
* `docs/`: internal architecture notes

## Immediate next steps

1. Install dependencies for root and `worker/`
2. Replace mock photo data with real API calls
3. Implement login session and upload endpoint
4. Add D1 schema and R2 bindings

## Current storage boundary

* Upload page now generates thumbnails in the browser before submit
* Upload page now generates display images in the browser before submit
* Upload page now optionally generates watermarked display images in the browser before submit
* Upload page now extracts EXIF in the browser before submit
* Worker can store originals, thumbnails, display images and watermarked display images into `PHOTOS_BUCKET` when R2 is bound
* Worker serves stored assets through `/assets/thumb/:id`, `/assets/display/:id` and `/assets/display-watermarked/:id`
* Worker persists EXIF-related fields into D1 and exposes them via `/api/photos/:id`
* Front-end Lightbox now prefers `watermarkedDisplayUrl` when available
* Admin routes now use `HttpOnly` Cookie auth and support real deletion of photo records plus stored objects
* Server-side EXIF extraction is still pending

## Local development

See [LocalDevelopment.md](E:\Projects\Luminote\docs\LocalDevelopment.md) for the current Next.js + Worker dev flow, local D1 schema initialization and R2 binding notes.
