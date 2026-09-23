import { getSelfByUsername } from "@/lib/auth-service";
import { redirect } from "next/navigation";
import { UrlCard } from "./_components/url-card";
import { KeyCard } from "./_components/key-card";
import { ConnectModal } from "./_components/connect-modal";
import { BrowserBroadcast } from "./_components/browser-broadcast";

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
      <div className="space-y-4">
        {/*
          Browser publishing first: it is the path that works on the free plan
          for several streamers at once, and it needs no setup. The ingress
          keys below are for anyone who wants OBS.
        */}
        <BrowserBroadcast />
        <UrlCard value={self.stream?.serverUrl || null} />
        <KeyCard value={self.stream?.streamKey || null} />
      </div>
    </div>
  );
};

export default KeysPage;