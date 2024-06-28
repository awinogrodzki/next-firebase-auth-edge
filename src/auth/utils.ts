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
      : json.error?.message ?? 'Missing error payload';

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

export function addReadonlyGetter(obj: object, prop: string, value: any): void {
  Object.defineProperty(obj, prop, {
    value,
    writable: false,
    enumerable: true
  });
}

export function deepCopy<T>(value: T): T {
  return deepExtend(undefined, value);
}

export function deepExtend(target: any, source: any): any {
  if (!(source instanceof Object)) {
    return source;
  }

  switch (source.constructor) {
    case Date: {
      const dateValue = source as any as Date;
      return new Date(dateValue.getTime());
    }

    case Object:
      if (target === undefined) {
        target = {};
      }
      break;

    case Array:
      target = [];
      break;

    default:
      return source;
  }

  for (const prop in source) {
    if (!Object.prototype.hasOwnProperty.call(source, prop)) {
      continue;
    }
    target[prop] = deepExtend(target[prop], source[prop]);
  }

  return target;
}

export function toUint8Array(key: string) {
  return Uint8Array.from(key.split('').map((x) => x.charCodeAt(0)));
}
