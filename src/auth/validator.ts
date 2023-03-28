export function isString(value: any): value is string {
  return typeof value === "string";
}

export function isNonEmptyString(value: any): value is string {
  return isString(value) && value !== "";
}

export function isObject(value: any): boolean {
  return typeof value === "object" && !isArray(value);
}

export function isArray<T>(value: any): value is T[] {
  return Array.isArray(value);
}

export function isNonNullObject<T>(value: T | null | undefined): value is T {
  return isObject(value) && value !== null;
}

export function isUid(uid: any): boolean {
  return typeof uid === "string" && uid.length > 0 && uid.length <= 128;
}

export function isNumber(value: any): boolean {
  return typeof value === "number" && !isNaN(value);
}

export function isISODateString(dateString: any): boolean {
  try {
    return (
      isNonEmptyString(dateString) &&
      new Date(dateString).toISOString() === dateString
    );
  } catch (e) {
    return false;
  }
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

export function isEmail(email: any): boolean {
  if (typeof email !== "string") {
    return false;
  }

  const re = /^[^@]+@[^@]+$/;
  return re.test(email);
}

export function isPhoneNumber(phoneNumber: any): boolean {
  if (typeof phoneNumber !== "string") {
    return false;
  }

  const re1 = /^\+/;
  const re2 = /[\da-zA-Z]+/;
  return re1.test(phoneNumber) && re2.test(phoneNumber);
}

export function isPassword(password: any): boolean {
  return typeof password === "string" && password.length >= 6;
}
