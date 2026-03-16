export function stripHtmlTags(content: string) {
  return content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function isProbablyHtml(content: string) {
  return /<\/?[a-z][\s\S]*>/i.test(content);
}

export function sanitizeArticleHtml(content: string) {
  return content
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
