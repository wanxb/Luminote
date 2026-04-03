# CODEBUDDY.md This file provides guidance to CodeBuddy when working with code in this repository.

## Common Development Commands

### Frontend (Next.js)
```bash
npm run dev              # Start Next.js dev server at http://localhost:3000
npm run build           # Build frontend for production
npm run start           # Start production server
npm run lint            # Run ESLint
```

### Worker (Cloudflare Worker API)
```bash
cd worker
npm run dev             # Start Worker dev server at http://localhost:8787
npm run deploy          # Deploy Worker to Cloudflare
npx tsc --noEmit        # Type check Worker code
npx wrangler d1 execute luminote --local --file schema.sql  # Initialize local D1 database
npx wrangler d1 execute luminote --remote --file schema.sql  # Initialize remote D1 database
```

### Full Stack Development
Start both services simultaneously: run `npm run dev` in the root directory and `cd worker && npm run dev` in a separate terminal.

## Architecture Overview

Luminote is a personal photography portfolio built with a decoupled frontend/backend architecture optimized for Cloudflare deployment.

### System Components

**Frontend (Next.js App Router)**
- `app/`: Next.js pages using App Router (`/` for gallery, `/upload` for admin)
- `components/`: Reusable UI components organized by feature (`gallery/`, `lightbox/`, `upload/`)
- `lib/`: Frontend utilities including API clients, EXIF extraction, and image processing

**Backend (Cloudflare Worker API)**
- `worker/src/`: Worker entry point and route handlers
  - `routes/`: API route handlers (`site.ts`, `photos.ts`, `admin.ts`, `assets.ts`)
  - `services/`: Business logic (`photo-service.ts`, `storage-service.ts`)
  - `utils/`: Shared utilities (`cors.ts`, `json.ts`)

**Storage Layer**
- **D1 Database**: SQLite-compatible storage for photo metadata (schema in `worker/schema.sql`)
- **R2 Storage**: Object storage for image variants (originals, thumbnails, display, watermarked)
- **Environment Configuration**: `worker/wrangler.toml` for bindings and variables

### Data Flow Architecture

**Gallery Flow:**
1. Frontend requests `/api/photos` → Worker queries D1 → Returns photo list with thumbnail URLs
2. User clicks photo → Frontend requests `/api/photos/:id` → Worker returns full metadata
3. Frontend loads display image (prioritizes watermarked version if available)
4. EXIF data and tags displayed in Lightbox sidebar

**Upload Flow (Browser-Side Processing):**
1. Admin uploads image → Frontend generates thumbnail, display, and optional watermarked variants
2. Frontend extracts EXIF metadata using `lib/upload/exif.ts`
3. POST `/api/admin/photos` with all variants → Worker validates auth → Stores to R2 → Writes to D1
4. Photo immediately appears in gallery

**Asset Delivery:**
- `/assets/thumb/:id` → R2 thumbnail
- `/assets/display/:id` → R2 display image
- `/assets/display-watermarked/:id` → R2 watermarked display image

### Admin Authentication
- Login via `POST /api/admin/login` → Sets `HttpOnly` session cookie
- Admin endpoints (`/api/admin/*`) validate session cookie on each request
- Session management via `GET /api/admin/session` and `POST /api/admin/logout`

### Image Storage Strategy

R2 bucket structure:
```
/originals/{photoId}.{ext}          # Original upload
/thumbs/{photoId}.webp              # Gallery thumbnail (480px)
/display/{photoId}.jpg              # Display image (2000px)
/display-watermarked/{photoId}.jpg  # Watermarked version
```

The Worker routes all assets through `/assets/*` endpoints rather than direct R2 URLs to enable authentication checks and fallback behavior.

### Frontend-Worker Integration

**API Client Configuration:**
- `lib/api/client.ts`: Base API client with credential handling
- `lib/api/admin-client.ts`: Admin-specific client with cookie-based auth
- Frontend uses `NEXT_PUBLIC_API_BASE_URL` for public endpoints
- Server-side APIs use `API_BASE_URL` for privileged calls

**CORS Configuration:**
- Worker handles preflight requests in `src/utils/cors.ts`
- All API responses include CORS headers for local development

### Local Development Setup

1. Install dependencies: `npm install` in root and `worker/`
2. Configure environment:
   - Copy `.env.example` to `.env.local` (optional, defaults exist)
   - Worker uses `worker/wrangler.toml` for configuration
3. Initialize D1 (optional for mock development):
   - Uncomment D1 binding in `worker/wrangler.toml`
   - Run `npx wrangler d1 execute luminote --local --file schema.sql`
4. Start both services: `npm run dev` (frontend) and `cd worker && npm run dev` (Worker)

**Fallback Behavior:**
- Without D1: Worker returns mock data from `mock-storage.ts`
- Without R2: Worker serves placeholder asset responses

### Key Implementation Details

**Image Processing:**
- Thumbnail generation: `lib/upload/thumbnail.ts` (canvas-based, 480px webp)
- Display image generation: `lib/upload/image-variants.ts` (long edge 2000px)
- Watermark application: Right-bottom corner, configurable text and opacity
- All processing happens in browser before upload to reduce Worker compute time

**EXIF Extraction:**
- Client-side extraction using `exifr` library in `lib/upload/exif.ts`
- Extracts aperture, shutter, ISO, focal length, device, lens, location, GPS
- Missing fields are automatically hidden in the UI

**Lightbox Architecture:**
- Desktop-style layout with main image area, sidebar, and thumbnail strip
- Two modes: standard view and immersive view (hides controls)
- Keyboard navigation: Arrow keys for navigation, ESC to close
- Click outside main image to close

### Deployment Considerations

**Cloudflare Configuration:**
- Worker deployment via `wrangler deploy`
- D1 binding in `wrangler.toml` requires real database ID from Cloudflare dashboard
- R2 binding requires bucket name configured in Cloudflare R2
- Environment variables in `wrangler.toml` for production settings

**Frontend Deployment:**
- Build with `npm run build`
- Deploy to Cloudflare Pages or any Next.js hosting platform
- Configure `NEXT_PUBLIC_API_BASE_URL` for production Worker endpoint

### Code Organization Patterns

**Route Handlers (Worker):**
- Each route file exports a handler function accepting `(request, env)`
- Handlers return Response objects or Promises<Response>
- CORS wrapping via `applyCors()` helper

**Frontend Components:**
- Feature-based organization under `components/`
- Each component folder contains a single `*-shell.tsx` file
- Components use the API client for data fetching

**Type Safety:**
- Shared TypeScript types in `lib/api/types.ts`
- Worker types defined inline in route handlers
- Frontend uses `exifr` types for EXIF data

### Current Limitations and Notes

- EXIF extraction is browser-side (not server-side)
- No tag filtering or search (tags are stored but not exposed in UI)
- No photo editing after upload (delete-only)
- Watermark is text-only, fixed position (right-bottom)
- No batch upload status persistence
- Admin session is simple cookie-based (no JWT expiration handling)

### Testing and Validation

After changes:
1. Type check: `npx tsc --noEmit` in both root and `worker/`
2. Build check: `npm run build` in root
3. Manual testing: Start both services, verify gallery loads, upload works, assets are accessible
