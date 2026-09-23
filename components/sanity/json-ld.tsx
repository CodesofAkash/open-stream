/**
 * One shared helper for structured data (AK-CMS-029).
 *
 * Parses defensively inside try/catch even when the CMS validates JSON on save
 * — never trust an external value's shape (AK-SEC-004). Bad JSON renders
 * nothing rather than throwing the page away.
 */
type Props = { data: unknown };

export const JsonLd = ({ data }: Props) => {
  let serialised: string;

  try {
    const value = typeof data === "string" ? JSON.parse(data) : data;
    if (!value) return null;
    serialised = JSON.stringify(value);
  } catch (error) {
    console.error("[json-ld] could not parse structured data:", error);
    return null;
  }

  return (
    <script
      type="application/ld+json"
      // Serialised from a parsed object, and < is escaped so the value cannot
      // close this script tag early.
      dangerouslySetInnerHTML={{ __html: serialised.replace(/</g, "\\u003c") }}
    />
  );
};
