import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/api/uploadthing',
  '/:username',
  '/search',
  // The Studio has its own Sanity login. Putting it behind Clerk as well would
  // lock out any editor who is not also an app user.
  '/studio(.*)',
  // Clerk's own Frontend API, proxied through this app. Must never require auth.
  '/__clerk(.*)',
])

// Proxying Clerk through /__clerk is only needed on a domain that cannot have
// its own DNS records — a *.vercel.app subdomain. On a real domain Clerk uses
// CNAMEs instead, which is the better setup, so the proxy follows the presence
// of NEXT_PUBLIC_CLERK_PROXY_URL: set it and the proxy runs, remove it and
// Clerk is reached directly. Nothing to redeploy differently either way.
const proxyUrl = process.env.NEXT_PUBLIC_CLERK_PROXY_URL

export default clerkMiddleware(
  async (auth, req) => {
    if (!isPublicRoute(req)) {
      await auth.protect()
    }
  },
  {
    frontendApiProxy: { enabled: Boolean(proxyUrl) },
  },
)

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    // Clerk's script is served from /__clerk/.../clerk.browser.js. The rule
    // above skips anything ending in .js, so without this line the proxy never
    // sees the one request it most needs to handle.
    '/__clerk/(.*)',
  ],
}
