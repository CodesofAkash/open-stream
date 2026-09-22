import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getSiteSettings } from "@/sanity/settings";

/**
 * 404 copy comes from the CMS like everything else (AK-SAN-057). The shipped
 * strings below are what renders before anyone fills the fields in — a
 * portfolio site left on the framework's default 404 is exactly the kind of
 * omission that is invisible until someone else finds it.
 */
const NotFoundPage = async () => {
  const settings = await getSiteSettings();

  const heading = settings?.notFoundHeading ?? "404";
  const message =
    settings?.notFoundMessage ?? "We couldn't find the page you were looking for.";
  const linkLabel = settings?.notFoundLinkLabel ?? "Go back home";

  return (
    <div className="h-full flex flex-col space-y-4 items-center justify-center text-muted-foreground">
      <h1 className="text-4xl">{heading}</h1>
      <p>{message}</p>
      <Button variant={"secondary"} asChild>
        <Link href={"/"}>{linkLabel}</Link>
      </Button>
    </div>
  );
};

export default NotFoundPage;
