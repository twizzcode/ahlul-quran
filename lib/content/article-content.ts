function decodeHtmlEntities(content: string) {
  return content
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/&#(\d+);/g, (_, code) => {
      const value = Number.parseInt(code, 10);
      return Number.isNaN(value) ? _ : String.fromCodePoint(value);
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => {
      const value = Number.parseInt(code, 16);
      return Number.isNaN(value) ? _ : String.fromCodePoint(value);
    });
}

export function stripHtmlTags(content: string) {
  return decodeHtmlEntities(content).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function isProbablyHtml(content: string) {
  return /<\/?[a-z][\s\S]*>/i.test(decodeHtmlEntities(content));
}

export function sanitizeArticleHtml(content: string) {
  return decodeHtmlEntities(content)
    .replace(
      /<\s*(script|style|iframe|object|embed|form|input|button|link|meta)[^>]*>[\s\S]*?<\s*\/\s*\1>/gi,
      ""
    )
    .replace(
      /<\s*(script|style|iframe|object|embed|form|input|button|link|meta)[^>]*\/?>/gi,
      ""
    )
    .replace(/\son\w+=(["']).*?\1/gi, "")
    .replace(/\s(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, ' $1="#"');
}
