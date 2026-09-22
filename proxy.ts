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

// The production Clerk instance is configured to proxy through /__clerk, which
// is how a *.vercel.app domain (no DNS records of its own) gets a first-party
// Clerk. The development instance talks to Clerk directly, so the proxy is
// switched on only for live keys.
const isProductionInstance = (
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? ''
).startsWith('pk_live_')

export default clerkMiddleware(
  async (auth, req) => {
    if (!isPublicRoute(req)) {
      await auth.protect()
    }
  },
  {
    frontendApiProxy: { enabled: isProductionInstance },
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
