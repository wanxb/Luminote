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
* Upload page now extracts EXIF in the browser before submit
* Worker can store originals and thumbnails into `PHOTOS_BUCKET` when R2 is bound
* Worker serves stored assets through `/assets/thumb/:id` and `/assets/display/:id`
* Display images currently reuse the original object
* Worker persists EXIF-related fields into D1 and exposes them via `/api/photos/:id`
* Watermarked display variants and server-side EXIF extraction are still pending
