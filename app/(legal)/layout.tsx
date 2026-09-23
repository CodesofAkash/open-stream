import { PublicChrome } from "@/components/sanity/public-chrome";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicChrome>
      {/* <main>, not <div>: every page in this group needs a main landmark. */}
      <main className="container max-w-4xl mx-auto py-10 px-4">
        {children}
      </main>
    </PublicChrome>
  );
}
