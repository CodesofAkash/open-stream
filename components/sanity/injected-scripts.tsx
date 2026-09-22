"use client";

import { useEffect } from "react";

/**
 * Executes editor-pasted script markup (AK-SAN-030 / AK-CMS-030).
 *
 * The non-obvious part: dangerouslySetInnerHTML RENDERS <script> tags and does
 * not EXECUTE them. The markup sits in the DOM doing nothing, with no error, so
 * it looks wired up and silently is not.
 *
 * Only a freshly created and appended script element runs, so each script node
 * is rebuilt via document.createElement, has its attributes copied and its text
 * set, and is then appended. Everything inserted is removed on cleanup so a
 * remount does not stack duplicates.
 *
 * SECURITY: this executes editor-supplied code by design, and is acceptable
 * only because the field is restricted to trusted editors (AK-SEC-007). It is
 * not a licence to render other CMS content as raw HTML.
 */
type Props = {
  html?: string | null;
  target?: "head" | "body";
};

export const InjectedScripts = ({ html, target = "body" }: Props) => {
  useEffect(() => {
    if (!html) return;

    const parent = target === "head" ? document.head : document.body;
    const template = document.createElement("template");
    template.innerHTML = html;

    const inserted: Node[] = [];

    template.content.childNodes.forEach((node) => {
      if (node.nodeName === "SCRIPT") {
        const original = node as HTMLScriptElement;
        const fresh = document.createElement("script");
        for (const attr of Array.from(original.attributes)) {
          fresh.setAttribute(attr.name, attr.value);
        }
        fresh.text = original.text;
        parent.appendChild(fresh);
        inserted.push(fresh);
        return;
      }

      const clone = node.cloneNode(true);
      parent.appendChild(clone);
      inserted.push(clone);
    });

    return () => {
      inserted.forEach((node) => {
        if (node.parentNode) node.parentNode.removeChild(node);
      });
    };
  }, [html, target]);

  return null;
};
