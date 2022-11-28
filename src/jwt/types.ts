/* eslint-disable functional/prefer-readonly-type */
type ImmutablePrimitive =
  | undefined
  | null
  | boolean
  | string
  | number
  | Function; // eslint-disable-line @typescript-eslint/ban-types

type ImmutableArray<T> = ReadonlyArray<Immutable<T>>;
type ImmutableMap<K, V> = ReadonlyMap<Immutable<K>, Immutable<V>>;
type ImmutableSet<T> = ReadonlySet<Immutable<T>>;
type ImmutableObject<T> = { readonly [K in keyof T]: Immutable<T[K]> };

// https://github.com/microsoft/TypeScript/issues/13923#issuecomment-557509399
export type Immutable<T> = T extends ImmutablePrimitive
  ? T
  : T extends Array<infer U>
  ? ImmutableArray<U>
  : T extends Map<infer K, infer V>
  ? ImmutableMap<K, V>
  : T extends Set<infer M>
  ? ImmutableSet<M>
  : ImmutableObject<T>;

export type DecodedJWTHeader = {
  typ: 'JWT';
  alg: 'RS256';
  kid?: string;
};

export type DecodedJWTPayload = Partial<{
  [key: string]: any;
  iss: string;
  sub: string;
  aud: string | string[];
  exp: number;
  nbf: number;
  iat: number;
  jti: string;
}>;
/* eslint-enable functional/prefer-readonly-type */
