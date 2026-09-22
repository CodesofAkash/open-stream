import { defineCliConfig } from "sanity/cli";

import { dataset, projectId } from "./sanity/env";

export default defineCliConfig({
  api: { projectId, dataset },
  // The Studio is embedded in the Next app; it is not deployed separately.
  autoUpdates: false,
});
