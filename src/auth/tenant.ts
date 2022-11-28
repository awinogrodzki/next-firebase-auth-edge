import { DecodedIdToken } from './token-verifier';

export type Claims = { [key: string]: any };

export type Tenant = {
  uid: string;
  customClaims: Claims;
  email?: string;
  emailVerified: boolean;
  phoneNumber?: string;
  displayName?: string;
  photoURL?: string;
  token?: string | null;
};

type CreateTenantOptions = {
  decodedToken?: DecodedIdToken | null;
  token?: string | null;
};

export const STANDARD_CLAIMS = [
  'aud',
  'auth_time',
  'email',
  'email_verified',
  'exp',
  'firebase',
  'iat',
  'iss',
  'name',
  'phone_number',
  'picture',
  'sub',
  'uid',
  'user_id',
];

export const filterStandardClaims = (obj: Claims = {}) => {
  const claims: Claims = {};
  Object.keys(obj).forEach(key => {
    if (!STANDARD_CLAIMS.includes(key)) {
      claims[key] = obj[key];
    }
  });
  return claims;
};

export const createTenant = ({
  decodedToken,
  token = null,
}: CreateTenantOptions = {}): Tenant => {
  // The token value should only be provided with the decoded admin value.
  if (token && !decodedToken) {
    throw new Error('The "token" value can only be set if the "decodedToken" property is defined.');
  }

  if (decodedToken) {
    const customClaims = filterStandardClaims(decodedToken);

    const {
      uid,
      email,
      email_verified: emailVerified,
      phone_number: phoneNumber,
      picture: photoURL,
      name: displayName,
    } = decodedToken;

    return {
      uid,
      email: email ?? undefined,
      customClaims,
      emailVerified: emailVerified ?? false,
      phoneNumber: phoneNumber ?? undefined,
      displayName: displayName ?? undefined,
      photoURL: photoURL ?? undefined,
      token,
    };
  }

  return {
    uid: '',
    email: undefined,
    customClaims: {},
    emailVerified: false,
    phoneNumber: undefined,
    displayName: undefined,
    photoURL: undefined,
    token: null,
  };
};
