import { redirect } from "next/navigation";

import { getSelfByUsername } from "@/lib/auth-service";
import StudioPanel from "./_components/studio-panel";

interface StudioPageProps {
  params: Promise<{
    username: string;
  }>;
}

const StudioPage = async ({ params }: StudioPageProps) => {
  const { username } = await params;
  const self = await getSelfByUsername(username);

  if (!self) {
    redirect("/");
  }

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Studio</h1>
      <StudioPanel username={self.username} />
    </div>
  );
};

export default StudioPage;
