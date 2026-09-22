import type { StructureResolver } from "sanity/structure";
import { Info, Mail, Scale, Settings, SlidersHorizontal, Sparkles } from "lucide-react";

/**
 * Studio sidebar.
 *
 * Singletons are pinned as single items rather than lists — a list implies
 * "create another", which for site settings or the about page is a trap. Legal
 * pages stay a real list, because privacy and terms are two of them.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Site settings")
        .icon(Settings)
        .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
      S.listItem()
        .title("Global configuration")
        .icon(SlidersHorizontal)
        .child(S.document().schemaType("globalConfig").documentId("globalConfig")),

      S.divider(),

      S.listItem()
        .title("About page")
        .icon(Info)
        .child(S.document().schemaType("aboutPage").documentId("aboutPage")),
      S.listItem()
        .title("Features page")
        .icon(Sparkles)
        .child(S.document().schemaType("featuresPage").documentId("featuresPage")),
      S.listItem()
        .title("Contact page")
        .icon(Mail)
        .child(S.document().schemaType("contactPage").documentId("contactPage")),

      S.divider(),

      S.listItem()
        .title("Legal pages")
        .icon(Scale)
        .child(S.documentTypeList("legalPage").title("Legal pages")),
    ]);
