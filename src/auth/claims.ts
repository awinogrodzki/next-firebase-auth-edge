export type Claims = {[key: string]: unknown};

export const STANDARD_CLAIMS = [
  'aud',
  'auth_time',
  'email',
  'email_verified',
  'exp',
  'firebase',
  'source_sign_in_provider',
  'iat',
  'iss',
  'name',
  'phone_number',
  'picture',
  'sub',
  'uid',
  'user_id'
];

export const filterStandardClaims = (obj: Claims = {}) => {
  const claims: Claims = {};
  Object.keys(obj).forEach((key) => {
    if (!STANDARD_CLAIMS.includes(key)) {
      claims[key] = obj[key];
    }
  });
  return claims;
};
