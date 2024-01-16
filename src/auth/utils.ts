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
