/**
 * Option lists used by more than one field (AK-SAN-042).
 * Never inline the same list twice — add it here and import it.
 */

export const HEADING_TAGS = [
  { title: "H1", value: "h1" },
  { title: "H2", value: "h2" },
  { title: "H3", value: "h3" },
  { title: "H4", value: "h4" },
  { title: "H5", value: "h5" },
  { title: "H6", value: "h6" },
] as const;

export const HEADING_STYLES = [
  { title: "Default", value: "default" },
  { title: "Accent", value: "accent" },
  { title: "Muted", value: "muted" },
] as const;

export const LINK_TYPES = [
  { title: "Internal page", value: "internal" },
  { title: "External URL", value: "external" },
] as const;

export const BUTTON_VARIANTS = [
  { title: "Primary", value: "default" },
  { title: "Secondary", value: "secondary" },
  { title: "Outline", value: "outline" },
  { title: "Ghost", value: "ghost" },
  { title: "Link", value: "link" },
] as const;
