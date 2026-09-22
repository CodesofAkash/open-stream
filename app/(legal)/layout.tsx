import { PublicChrome } from "@/components/sanity/public-chrome";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicChrome>
      <div className="container max-w-4xl mx-auto py-10 px-4">
        {children}
      </div>
    </PublicChrome>
  );
}
