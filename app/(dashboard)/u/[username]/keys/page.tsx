import Link from "next/link";

import { getSelfByUsername } from "@/lib/auth-service";
import { redirect } from "next/navigation";
import { UrlCard } from "./_components/url-card";
import { KeyCard } from "./_components/key-card";
import { ConnectModal } from "./_components/connect-modal";

interface KeysPageProps {
  params: Promise<{
    username: string;
  }>;
}

const KeysPage = async ({ params }: KeysPageProps) => {
  const { username } = await params;
  const self = await getSelfByUsername(username);

  if (!self) {
    redirect("/");
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Keys & URLs</h1>
        <ConnectModal />
      </div>
      {/*
        This page is the OBS route only. Publishing from the browser — which
        needs no keys at all — lives on the Stream tab.
      */}
      <p className="mb-4 text-sm text-muted-foreground">
        Point OBS, Streamlabs or any RTMP/WHIP encoder at these. To stream without
        installing anything, use the{" "}
        <Link href={`/u/${self.username}`} className="text-primary underline underline-offset-4">
          Stream
        </Link>{" "}
        tab instead.
      </p>
      <div className="space-y-4">
        <UrlCard value={self.stream?.serverUrl || null} />
        <KeyCard value={self.stream?.streamKey || null} />
      </div>
    </div>
  );
};

export default KeysPage;