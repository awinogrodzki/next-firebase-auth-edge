export function isObject(value: any): boolean {
  return typeof value === "object" && !isArray(value);
}

export function isArray<T>(value: any): value is T[] {
  return Array.isArray(value);
}

export function isNonNullObject<T>(value: T | null | undefined): value is T {
  return isObject(value) && value !== null;
}

export function isEmail(email: any): boolean {
  if (typeof email !== 'string') {
    return false;
  }
  // There must at least one character before the @ symbol and another after.
  const re = /^[^@]+@[^@]+$/;
  return re.test(email);
}

export function isURL(urlStr: any): boolean {
  if (typeof urlStr !== "string") {
    return false;
  }

  const re = /[^a-z0-9:/?#[\]@!$&'()*+,;=.\-_~%]/i;
  if (re.test(urlStr)) {
    return false;
  }
  try {
    const uri = new URL(urlStr);
    const scheme = uri.protocol;
    const hostname = uri.hostname;
    const pathname = uri.pathname;
    if (scheme !== "http:" && scheme !== "https:") {
      return false;
    }

    if (
      !hostname ||
      !/^[a-zA-Z0-9]+[\w-]*([.]?[a-zA-Z0-9]+[\w-]*)*$/.test(hostname)
    ) {
      return false;
    }

    const pathnameRe = /^(\/[\w\-.~!$'()*+,;=:@%]+)*\/?$/;
    if (pathname && pathname !== "/" && !pathnameRe.test(pathname)) {
      return false;
    }
  } catch (e) {
    return false;
  }
  return true;
}
