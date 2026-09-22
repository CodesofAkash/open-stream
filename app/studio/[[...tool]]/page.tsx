import { isSanityConfigured } from "@/sanity/env";

import Studio from "./Studio";

export const dynamic = "force-static";

export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  // Without a project there is nothing for the Studio to talk to, and mounting
  // it anyway throws "Configuration must contain `projectId`" as a 500. Say
  // what to do instead.
  if (!isSanityConfigured) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-2xl font-semibold">Sanity is not configured yet</h1>
        <p className="max-w-prose text-muted-foreground">
          Create a project at sanity.io/manage, then set{" "}
          <code className="rounded bg-muted px-1.5 py-0.5">NEXT_PUBLIC_SANITY_PROJECT_ID</code>{" "}
          and <code className="rounded bg-muted px-1.5 py-0.5">NEXT_PUBLIC_SANITY_DATASET</code>.
          The rest of the site runs normally until then.
        </p>
      </main>
    );
  }

  return <Studio />;
}
