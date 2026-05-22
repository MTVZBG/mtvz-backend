const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

const escapeAttribute = (value: string) =>
  escapeHtml(value).replace(/"/g, "&quot;")

const RICH_TEXT_ALLOWED_TAGS = new Set([
  "p",
  "strong",
  "em",
  "ul",
  "ol",
  "li",
  "h2",
  "h3",
  "a",
  "br",
])

const sanitizeHref = (href: unknown) => {
  const trimmed = String(href ?? "").trim().replace(/[\u0000-\u001f\u007f\s]+/g, "")
  const lower = trimmed.toLowerCase()

  if (!trimmed) {
    return ""
  }

  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("//")
  ) {
    return ""
  }

  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("#") ||
    lower.startsWith("http://") ||
    lower.startsWith("https://")
  ) {
    return trimmed
  }

  return ""
}

const isExternalHref = (href: string) => /^https?:\/\//i.test(href)

export const sanitizeRichText = (value: unknown) => {
  const input = String(value ?? "")

  if (!input.trim()) {
    return ""
  }

  return input
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]*>|[^<]+/g, (token) => {
      if (!token.startsWith("<")) {
        return escapeHtml(token)
      }

      const tagMatch = token.match(/^<\/?\s*([a-zA-Z0-9]+)([^>]*)>$/)

      if (!tagMatch) {
        return ""
      }

      const tagName = tagMatch[1].toLowerCase()

      if (!RICH_TEXT_ALLOWED_TAGS.has(tagName)) {
        return ""
      }

      if (/^<\//.test(token)) {
        return tagName === "br" ? "" : `</${tagName}>`
      }

      if (tagName === "br") {
        return "<br>"
      }

      if (tagName !== "a") {
        return `<${tagName}>`
      }

      const rawAttributes = tagMatch[2] || ""
      const attributeMatches = Array.from(
        rawAttributes.matchAll(
          /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g
        )
      )
      const attributes = new Map(
        attributeMatches.map((match) => [
          match[1].toLowerCase(),
          match[2] ?? match[3] ?? match[4] ?? "",
        ])
      )
      const href = sanitizeHref(attributes.get("href"))

      if (!href) {
        return "<a>"
      }

      const target = attributes.get("target")
      const safeTarget =
        target && ["_blank", "_self", "_parent", "_top"].includes(target)
          ? target
          : ""
      const rel = isExternalHref(href) ? "noopener noreferrer" : ""
      const renderedAttributes = [`href="${escapeAttribute(href)}"`]

      if (safeTarget) {
        renderedAttributes.push(`target="${escapeAttribute(safeTarget)}"`)
      }

      if (rel) {
        renderedAttributes.push(`rel="${rel}"`)
      }

      return `<a ${renderedAttributes.join(" ")}>`
    })
    .trim()
}
