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
