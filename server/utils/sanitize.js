import sanitizeHtml from "sanitize-html";

/*
 * Server-side sanitizer for post content (stored as editor HTML).
 * Runs on write (postController) and on read (utils/posts.js mapPost) so
 * both new and legacy rows are safe to render with dangerouslySetInnerHTML.
 *
 * Allowed: the editor's own output (h1/h2, blockquote, pre, lists, links,
 * images, bold/italic) — nothing else. No style/class attrs, no event
 * handlers, no javascript: URLs, no script/iframe/object/embed.
 */

const OPTIONS = {
  allowedTags: [
    "p", "br", "div", "span",
    "b", "strong", "i", "em", "u", "s", "strike",
    "h1", "h2", "h3", "h4",
    "ul", "ol", "li",
    "blockquote", "pre", "code",
    "a", "img", "hr", "figure", "figcaption",
  ],
  allowedAttributes: {
    a: ["href", "title"],
    img: ["src", "alt", "title"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: {
    img: ["http", "https"],
  },
  allowProtocolRelative: false,
  disallowedTagsMode: "discard",
};

/** Sanitizes stored editor HTML; returns a safe string ('' for non-strings). */
export function sanitizePostHtml(html) {
  if (typeof html !== "string" || !html) return "";
  return sanitizeHtml(html, OPTIONS);
}
