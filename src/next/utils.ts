export function getReferer(headers: Headers) {
  const host =
    headers.get('X-Forwarded-Host') ?? headers.get('Host') ?? undefined;
  const protocol = headers.get('X-Forwarded-Proto');
  const fallback = protocol && host ? `${protocol}://${host}/` : undefined;

  return fallback ?? host;
}
