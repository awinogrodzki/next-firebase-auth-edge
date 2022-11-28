export function isString(value: any): value is string {
  return typeof value === 'string';
}

export function isBase64String(value: any): boolean {
  if (!isString(value)) {
    return false;
  }
  return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value);
}

export function isNonEmptyString(value: any): value is string {
  return isString(value) && value !== '';
}

export function isObject(value: any): boolean {
  return typeof value === 'object' && !isArray(value);
}

export function isArray<T>(value: any): value is T[] {
  return Array.isArray(value);
}

export function isNonEmptyArray<T>(value: any): value is T[] {
  return isArray(value) && value.length !== 0;
}

export function isBoolean(value: any): boolean {
  return typeof value === 'boolean';
}

export function isNumber(value: any): boolean {
  return typeof value === 'number' && !isNaN(value);
}

export function isNonNullObject<T>(value: T | null | undefined): value is T {
  return isObject(value) && value !== null;
}

/**
 * Validates that a string is a valid Firebase Auth uid.
 *
 * @param uid - The string to validate.
 * @returns Whether the string is a valid Firebase Auth uid.
 */
export function isUid(uid: any): boolean {
  return typeof uid === 'string' && uid.length > 0 && uid.length <= 128;
}

/**
 * Validates that a string is a valid Firebase Auth password.
 *
 * @param password - The password string to validate.
 * @returns Whether the string is a valid Firebase Auth password.
 */
export function isPassword(password: any): boolean {
  // A password must be a string of at least 6 characters.
  return typeof password === 'string' && password.length >= 6;
}


/**
 * Validates that a string is a valid email.
 *
 * @param email - The string to validate.
 * @returns Whether the string is valid email or not.
 */
export function isEmail(email: any): boolean {
  if (typeof email !== 'string') {
    return false;
  }
  // There must at least one character before the @ symbol and another after.
  const re = /^[^@]+@[^@]+$/;
  return re.test(email);
}


/**
 * Validates that a string is a valid phone number.
 *
 * @param phoneNumber - The string to validate.
 * @returns Whether the string is a valid phone number or not.
 */
export function isPhoneNumber(phoneNumber: any): boolean {
  if (typeof phoneNumber !== 'string') {
    return false;
  }
  // Phone number validation is very lax here. Backend will enforce E.164
  // spec compliance and will normalize accordingly.
  // The phone number string must be non-empty and starts with a plus sign.
  const re1 = /^\+/;
  // The phone number string must contain at least one alphanumeric character.
  const re2 = /[\da-zA-Z]+/;
  return re1.test(phoneNumber) && re2.test(phoneNumber);
}

/**
 * Validates that a string is a valid ISO date string.
 *
 * @param dateString - The string to validate.
 * @returns Whether the string is a valid ISO date string.
 */
export function isISODateString(dateString: any): boolean {
  try {
    return isNonEmptyString(dateString) &&
      (new Date(dateString).toISOString() === dateString);
  } catch (e) {
    return false;
  }
}


/**
 * Validates that a string is a valid UTC date string.
 *
 * @param dateString - The string to validate.
 * @returns Whether the string is a valid UTC date string.
 */
export function isUTCDateString(dateString: any): boolean {
  try {
    return isNonEmptyString(dateString) &&
      (new Date(dateString).toUTCString() === dateString);
  } catch (e) {
    return false;
  }
}


/**
 * Validates that a string is a valid web URL.
 *
 * @param urlStr - The string to validate.
 * @returns Whether the string is valid web URL or not.
 */
export function isURL(urlStr: any): boolean {
  if (typeof urlStr !== 'string') {
    return false;
  }
  // Lookup illegal characters.
  const re = /[^a-z0-9:/?#[\]@!$&'()*+,;=.\-_~%]/i;
  if (re.test(urlStr)) {
    return false;
  }
  try {
    const uri = new URL(urlStr);
    const scheme = uri.protocol;
    const hostname = uri.hostname;
    const pathname = uri.pathname;
    if ((scheme !== 'http:' && scheme !== 'https:')) {
      return false;
    }
    // Validate hostname: Can contain letters, numbers, underscore and dashes separated by a dot.
    // Each zone must not start with a hyphen or underscore.
    if (!hostname || !/^[a-zA-Z0-9]+[\w-]*([.]?[a-zA-Z0-9]+[\w-]*)*$/.test(hostname)) {
      return false;
    }
    // Allow for pathnames: (/chars+)*/?
    // Where chars can be a combination of: a-z A-Z 0-9 - _ . ~ ! $ & ' ( ) * + , ; = : @ %
    const pathnameRe = /^(\/[\w\-.~!$'()*+,;=:@%]+)*\/?$/;
    // Validate pathname.
    if (pathname &&
      pathname !== '/' &&
      !pathnameRe.test(pathname)) {
      return false;
    }
    // Allow any query string and hash as long as no invalid character is used.
  } catch (e) {
    return false;
  }
  return true;
}


/**
 * Validates that the provided topic is a valid FCM topic name.
 *
 * @param topic - The topic to validate.
 * @returns Whether the provided topic is a valid FCM topic name.
 */
export function isTopic(topic: any): boolean {
  if (typeof topic !== 'string') {
    return false;
  }

  const VALID_TOPIC_REGEX = /^(\/topics\/)?(private\/)?[a-zA-Z0-9-_.~%]+$/;
  return VALID_TOPIC_REGEX.test(topic);
}

