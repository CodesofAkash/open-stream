# OpenStream

A live streaming platform in the shape of Twitch: browse live channels, watch with real-time
chat, follow and block, and a creator dashboard for going live from either OBS or straight from
the browser — including an in-browser scene compositor for mixing camera, screen and overlays
into a single output, similar in spirit to OBS Studio.

**Live:** [open-stream.codesofakash.in](https://open-stream.codesofakash.in)

## Overview

OpenStream is a full-stack Next.js application built around [LiveKit](https://livekit.io) for
real-time video and [Sanity](https://sanity.io) for editorial content. The engineering focus is
on two things most streaming-platform clones skip: making the free tier of a WebRTC SFU actually
usable for several concurrent broadcasters, and giving a browser-only streamer real OBS-style
control over their output rather than a single raw camera feed.

Two ways to go live are both first-class: an OBS/RTMP-WHIP path through LiveKit ingress for
anyone with existing broadcast software, and a browser-only path where the streamer joins their
own room as a publishing participant — no ingress, no transcoding minutes spent, which matters
because LiveKit Cloud's free tier caps concurrent ingresses but not concurrent participants.

## Features

**Streaming**
- Dual publishing paths: OBS via RTMP/WHIP ingress, or camera/screen directly from the browser
- A canvas-based scene compositor ("Studio") for browser streamers — camera, screen, image, text,
  colour, and video/audio-file sources composited onto one output with drag/resize/rotate,
  interactive on-canvas cropping, a mirror toggle, snapping alignment guides, and multi-select
- A "direct mode" that skips compositing entirely when the scene is a single full-frame source,
  publishing the raw capture at native resolution instead of a re-encoded canvas
- Six selectable output resolutions (360p–4K) and an optional simulcast toggle so viewers can pick
  a lower-bandwidth stream
- A live stream-health readout (resolution, bitrate, fps, packet loss, round-trip time) that
  diagnoses *why* quality dropped — CPU, upload bandwidth, or connection instability — rather than
  just showing raw numbers
- A Web Audio mixer with a real-time level meter, per-source gain and mute, and a limiter across
  the mixed output, so a shared tab's audio and the microphone are combined into one track
  correctly instead of colliding as two competing tracks
- Persistent broadcasts that survive client-side navigation — going live doesn't pin the streamer
  to one page

**Platform**
- Real-time chat over LiveKit data channels, with slow-mode, followers-only, and enable/disable
  controls
- Follow / unfollow and block / unblock
- Full-text search across streams and users, category and tag-based discovery
- A creator dashboard: stream key management, chat settings, community/blocked-user management

**Content & SEO**
- Editorial pages (About, Contact, Privacy, Terms) served from an embedded Sanity Studio, with
  static-constants as the fallback when Sanity isn't configured
- `sitemap.xml`, `robots.txt`, `llms.txt`, and a JSON `ai-catalog.json` for AI-crawler/agentic
  discoverability
- Consent-gated PostHog analytics — nothing loads until the visitor accepts

## Tech Stack

**Frontend**
Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Radix UI / shadcn/ui, Zustand,
Konva / react-konva (the Studio canvas), dnd-kit (drag-to-reorder scenes and sources)

**Backend**
Next.js Server Actions, LiveKit Server SDK (tokens, ingress, webhooks), Clerk webhooks (via Svix)

**Database**
PostgreSQL via Prisma ORM with the `@prisma/adapter-pg` driver adapter — works against Neon,
Supabase, Railway, or any standard Postgres host

**CMS**
Sanity (embedded Studio, GROQ queries, live preview / draft mode)

**Real-time**
LiveKit (SFU, RTMP/WHIP ingress, browser participant publishing, data-channel chat), the Web
Audio API (client-side mixing)

**Authentication**
Clerk

**Infrastructure / Deployment**
Vercel (frontend), LiveKit Cloud, UploadThing (file uploads), PostHog + Vercel Speed Insights
(analytics)

## Architecture

Two independent publishing paths converge on the same LiveKit room:

1. **OBS / ingress path** — a stream key is generated server-side via the LiveKit Server SDK; OBS
   pushes RTMP or WHIP to LiveKit's ingress, which LiveKit transcodes and republishes into the
   room. This is the expensive path (transcode minutes are capped on the free tier), used for
   anyone with existing broadcast tooling.
2. **Browser path** — the streamer's own tab joins the room as an ordinary publishing participant.
   No ingress, no transcoding — this is what makes several concurrent streamers workable on a
   free LiveKit Cloud plan, since the cap that matters there is on ingresses, not participants.

For the browser path, the Studio composites every enabled source onto an off-screen `<canvas>` at
30fps and publishes `canvas.captureStream()` as the outgoing video track — so what the streamer
sees in the editor is exactly what viewers receive, not a separate preview that can drift from
the real output. When the active scene is a single full-frame source, that step is skipped and
the raw MediaStream track publishes directly, avoiding the CPU cost of compositing something
there's nothing to composite.

A LiveKit webhook (`/api/webhooks/livekit`) keeps `Stream.isLive` in sync with what LiveKit
actually reports, so a browser tab closing without a clean disconnect doesn't leave a channel
stuck showing as live.

## Project Structure

```
app/
├── (auth)/              # Clerk sign-in / sign-up
├── (browse)/             # Public: home feed, channel pages, search
├── (dashboard)/           # Creator dashboard: stream, studio, keys, chat, community
├── (legal)/               # Sanity-backed About/Contact/Privacy/Terms
├── api/webhooks/          # Clerk + LiveKit webhooks
└── studio/                 # Embedded Sanity Studio

actions/                  # Server actions (writes)
lib/                       # Service layer (reads), Sanity client, Studio domain logic
components/
├── studio/                # The canvas compositor and its panels
├── stream-player/          # The viewer-facing video player
└── ui/                     # shadcn/ui primitives

prisma/                    # Schema (User, Stream, Follow, Block, Scene, …) and seed script
sanity/                    # Schemas, GROQ queries, SEO mapping
```

## Getting Started

### Prerequisites

- Node.js 20+
- A PostgreSQL database
- Accounts: [Clerk](https://clerk.dev), [LiveKit Cloud](https://livekit.io),
  [UploadThing](https://uploadthing.com) — [Sanity](https://sanity.io) is optional, the app
  renders without it

### Install

```bash
npm install
```

### Environment variables

Copy `.env.example` to `.env` and fill in:

```
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
CLERK_WEBHOOK_SECRET
DATABASE_URL
DIRECT_DATABASE_URL
LIVEKIT_API_URL
LIVEKIT_API_KEY
LIVEKIT_API_SECRET
NEXT_PUBLIC_LIVEKIT_WS_URL
UPLOADTHING_TOKEN
NEXT_PUBLIC_EMAILJS_SERVICE_ID
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
NEXT_PUBLIC_SANITY_PROJECT_ID      # optional — CMS reads return empty without it
NEXT_PUBLIC_SANITY_DATASET
NEXT_PUBLIC_SANITY_API_VERSION
SANITY_API_READ_TOKEN
```

Full descriptions and where to get each value are in `.env.example`.

### Database

```bash
npx prisma db push
npm run seed   # optional — sample categories, tags, users and streams
```

### Run

```bash
npm run dev
```

## Deployment

Deployed on Vercel from the `main` branch. `npm run build` runs `prisma db push` ahead of
`next build`, so schema changes ship with the code that depends on them. Production Clerk keys
(not `pk_test_`/`sk_test_`) are required — test-instance keys force `Cache-Control: no-store` on
every response and break indexing.

## Current Status

Actively developed. The core platform — auth, follow/block, chat, search, OBS ingress streaming,
and browser publishing — is stable and deployed. The Studio scene compositor is functional and
deployed but is CPU-intensive by nature (it's compositing and re-encoding a video frame in real
time in the browser); the in-app diagnostics exist specifically to make that cost visible rather
than to hide it, and Direct Mode exists as the lighter-weight path for the common single-source
case.
