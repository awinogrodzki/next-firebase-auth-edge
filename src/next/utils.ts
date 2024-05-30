export function getReferer(headers: Headers) {
  const referer = headers.get('Referer');
  const host =
    headers.get('X-Forwarded-Host') ?? headers.get('Host') ?? undefined;
  const protocol = headers.get('X-Forwarded-Proto');
  const fallback = protocol && host ? `${protocol}://${host}/` : undefined;

  return referer ?? fallback ?? host;
}
