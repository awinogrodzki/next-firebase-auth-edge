import {DecodedIdToken} from './token-verifier';
import {JWTPayload} from 'jose';

export function formatString(str: string, params?: object): string {
  let formatted = str;
  Object.keys(params || {}).forEach((key) => {
    formatted = formatted.replace(
      new RegExp('{' + key + '}', 'g'),
      (params as {[key: string]: string})[key]
    );
  });
  return formatted;
}

async function getDetailFromResponse(response: Response): Promise<string> {
  const json = await response.json();

  if (!json) {
    return 'Missing error payload';
  }

  let detail =
    typeof json.error === 'string'
      ? json.error
      : (json.error?.message ?? 'Missing error payload');

  if (json.error_description) {
    detail += ' (' + json.error_description + ')';
  }

  return detail;
}

export async function fetchJson(url: string, init: RequestInit) {
  return (await fetchAny(url, init)).json();
}

export async function fetchText(url: string, init: RequestInit) {
  return (await fetchAny(url, init)).text();
}

export async function fetchAny(url: string, init: RequestInit) {
  const response = await fetch(url, init);

  if (!response.ok) {
    throw new Error(await getDetailFromResponse(response));
  }

  return response;
}

export function mapJwtPayloadToDecodedIdToken(payload: JWTPayload) {
  const decodedIdToken = payload as DecodedIdToken;
  decodedIdToken.uid = decodedIdToken.sub;
  return decodedIdToken;
}

export function addReadonlyGetter(
  obj: object,
  prop: string,
  value: unknown
): void {
  Object.defineProperty(obj, prop, {
    value,
    writable: false,
    enumerable: true
  });
}

export function deepCopy<T>(value: T): T {
  return deepExtend(undefined, value) as T;
}

export function deepExtend<T>(target: T, source: T): T {
  if (!(source instanceof Object)) {
    return source;
  }

  switch (source.constructor) {
    case Date: {
      const dateValue = source as unknown as Date;
      return new Date(dateValue.getTime()) as T;
    }

    case Object:
      if (target === undefined) {
        target = {} as T;
      }
      break;

    case Array:
      target = [] as T;
      break;

    default:
      return source;
  }

  for (const prop in source) {
    if (!Object.prototype.hasOwnProperty.call(source, prop)) {
      continue;
    }

    const objectTarget = target as {[key: string]: unknown};
    objectTarget[prop] = deepExtend(objectTarget[prop], objectTarget[prop]);
  }

  return target;
}

export function toUint8Array(key: string) {
  return Uint8Array.from(key.split('').map((x) => x.charCodeAt(0)));
}
