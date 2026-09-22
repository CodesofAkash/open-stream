import type { ReactNode } from "react";

import type { GlobalConfig } from "@/sanity/types";

/**
 * Replaces every public page with a holding message when maintenance is on
 * (AK-SAN-031).
 *
 * The Studio route is NOT wrapped in this — see the root layout. Otherwise
 * editors lock themselves out of the very document that turns maintenance off,
 * and the only way back is a deploy.
 */
type Props = {
  config?: GlobalConfig | null;
  children: ReactNode;
};

export const MaintenanceGate = ({ config, children }: Props) => {
  if (!config?.maintenanceEnabled) return <>{children}</>;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-semibold">
        {config.maintenanceHeading || "We will be right back"}
      </h1>
      {config.maintenanceMessage ? (
        <p className="max-w-prose text-muted-foreground">{config.maintenanceMessage}</p>
      ) : null}
    </main>
  );
};
